async function loadEmotionFrequency() {
  const uid = localStorage.getItem("uid");
  const urlParams = new URLSearchParams(window.location.search);
  const month = parseInt(urlParams.get('month')); // URL에서 month를 읽고 없으면 9월로 기본 설정
  const year = new Date().getFullYear();

  // 월 이름 표시
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  document.getElementById('title').textContent = `이달의 감정 (${monthNames[month - 1]})`;

  const emotionMap = {
    "즐거움": "joy",
    "평온": "calmness",
    "행복": "happiness",
    "사랑": "love",
    "분노": "anger",
    "불안": "anxiety",
    "슬픔": "sadness",
    "우울": "depression",
    "외로움": "loneliness",
    "절망": "despair",
    "짜증": "annoyance",
    "피곤": "tiredness",
    "허무함": "emptiness"
  };

  // 서버로 요청하여 감정 빈도 데이터 가져오기
  const response = await fetch(`/emotion-frequency?uid=${uid}&year=${year}&month=${month}`);
  const emotionData = await response.json();

  const emotionList = document.getElementById('emotion-list');
  let totalCount = emotionData.reduce((acc, emotion) => acc + emotion.count, 0);

  // 감정 데이터를 정렬해서 막대 그래프와 함께 화면에 표시
  emotionData.forEach(emotion => {
    const emotionItem = document.createElement('div');
    emotionItem.className = 'emotion-item';

    const emojiName = emotionMap[emotion.EMOJI] || 'default';

    const img = document.createElement('img');
    img.src = `../emoji/${emojiName}.png`;
    emotionItem.appendChild(img);

    const span = document.createElement('span');
    span.textContent = `${emotion.EMOJI} ${emotion.count}회`;
    emotionItem.appendChild(span);

    const percentage = ((emotion.count / totalCount) * 100).toFixed(1);
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = `${percentage}%`;
    emotionItem.appendChild(bar);

    const percentageText = document.createElement('span');
    percentageText.textContent = ` ${percentage}%`;
    percentageText.style.marginLeft = '10px';
    emotionItem.appendChild(percentageText);

    emotionList.appendChild(emotionItem);
  });
}

document.addEventListener('DOMContentLoaded', loadEmotionFrequency);
