async function submitPost() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const response = await fetch('/save-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
        alert('게시글이 저장되었습니다.');
        window.location.href = 'community.html';  // 게시글 저장 후 커뮤니티 페이지로 이동
    } else {
        alert('게시글 저장에 실패했습니다.');
    }
}
