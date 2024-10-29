document.addEventListener('DOMContentLoaded', loadEntries);

document.getElementById('sort-options').addEventListener('change', function() {
    loadEntries(this.value);
});
document.getElementById('delete-button').addEventListener('click', deleteEntries);
document.getElementById('edit-button').addEventListener('click', editEntry);

async function loadEntries(sortOrder = 'recent') {
    const response = await fetch('/get-diaries');
    const entries = await response.json();
    
    const entryList = document.getElementById('entries');
    entryList.innerHTML = '';  // 기존 일기 초기화

    // 정렬 버튼(최신순, 오래된 순, 등록 최신순, 등록 오래된 순)
    entries.sort((a, b) => {
        if (sortOrder === 'recent') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortOrder === 'oldest') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortOrder === 'created-newest') {
            return b.id.localeCompare(a.id);
        } else if (sortOrder === 'created-oldest') {
            return a.id.localeCompare(b.id);
        }
    });

    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('p-4', 'bg-white', 'shadow', 'rounded', 'relative');
    
        entryElement.innerHTML = `
            <input type="checkbox" class="absolute top-2 left-2" data-id="${entry.id}">
            <h2 class="text-xl font-bold">${entry.date}</h2>
            <p class="mt-2 content-preview" id="content-${entry.id}">${entry.content.length > 100 ? entry.content.slice(0, 100) + '...' : entry.content}</p>
            <button class="text-blue-500 mt-4 view-button" data-id="${entry.id}" data-expanded="false">보기</button>
        `;
    
        entryList.appendChild(entryElement);

        // 보기 버튼 클릭 이벤트
        entryElement.querySelector('.view-button').addEventListener('click', function() {
            const contentElement = document.getElementById(`content-${entry.id}`);
            const isExpanded = this.getAttribute('data-expanded') === 'true';

            if (isExpanded) {
                // 내용 접기
                contentElement.textContent = entry.content.length > 100 ? entry.content.slice(0, 100) + '...' : entry.content;
                this.textContent = '보기';
                this.setAttribute('data-expanded', 'false');
            } else {
                // 내용 펼치기
                contentElement.textContent = entry.content;
                this.textContent = '접기';
                this.setAttribute('data-expanded', 'true');
            }
        });
    });
}

async function deleteEntries() {
    const selectedEntries = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
    const idsToDelete = selectedEntries.map(entry => entry.getAttribute('data-id'));

    if (idsToDelete.length === 0) {
        alert('삭제할 일기를 선택하세요.');
        return;
    }

    const confirmed = confirm(`정말로 ${idsToDelete.length}개의 일기를 삭제하시겠습니까?`);
    if (confirmed) {
        const response = await fetch('/delete-diaries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsToDelete })
        });

        const result = await response.json();
        if (result.success) {
            alert('삭제가 완료되었습니다.');
            loadEntries();
        } else {
            alert('삭제 실패.');
        }
    }
}

async function editEntry() {
    const selectedEntries = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));

    if (selectedEntries.length !== 1) {
        alert('수정할 일기를 하나만 선택하세요.');
        return;
    }

    const entryId = selectedEntries[0].getAttribute('data-id');
    location.href = `diary_correction.html?id=${entryId}`;
}
