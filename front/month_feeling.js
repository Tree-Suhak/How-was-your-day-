async function loadEmotionFrequency() {
    const uid = localStorage.getItem("uid");  // 로컬 스토리지에서 사용자 UID 가져오기
    const currentPageUrl = window.location.href;
    const currentPage = currentPageUrl.split('/').pop();
  
    // 현재 페이지에 따라 해당 월 설정
    let year = new Date().getFullYear();
    let month = 9;
  
    if (currentPage === 'january.html') {
      month = 1;
    } else if (currentPage === 'february.html') {
      month = 2;
    } else if (currentPage === 'march.html') {
      month = 3;
    }  else if (currentPage === 'april.html') {
      month = 4;
    } else if (currentPage === 'may.html') {
      month = 5;
    } else if (currentPage === 'june.html') {
      month = 6;
    } else if (currentPage === 'july.html') {
      month = 7;
    } else if (currentPage === 'august.html') {
      month = 8;
    } else if (currentPage === 'september.html') {
      month = 9;
    } else if (currentPage === 'october.html') {
      month = 10;
    } else if (currentPage === 'november.html') {
      month = 11;
    } else if (currentPage === 'december.html') {
      month = 12;
    }


    // 감정명과 영어 파일명을 매핑 객체
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
  
    // 감정 빈도 데이터를 서버에서 가져오기
    const response = await fetch(`/emotion-frequency?uid=${uid}&year=${year}&month=${month}`);
    const emotionData = await response.json();
  
    // 감정 데이터 정렬해서 화면에 표시
    const emotionList = document.getElementById('emotion-list');
    emotionData.forEach(emotion => {
      const emotionItem = document.createElement('div');
      emotionItem.className = 'emotion-item';
  
      // 한국어 감정 -> 영어로 변환
      const emojiName = emotionMap[emotion.EMOJI] || 'default';  // 매핑된 값이 없으면 'default'로 처리
  
      // 이모티콘 이미지
      const img = document.createElement('img');
      img.src = `../emoji/${emojiName}.png`;  // 이모티콘 이미지 경로
      console.log("Emotion Emoji:", emojiName);
      emotionItem.appendChild(img);
  
      // 감정명과 빈도
      const span = document.createElement('span');
      span.textContent = `${emotion.EMOJI} ${emotion.count}회`;
      console.log("Emotion Emoji:", emotion.EMOJI);
      emotionItem.appendChild(span);
  
      emotionList.appendChild(emotionItem);
    });
  }
  
  document.addEventListener('DOMContentLoaded', loadEmotionFrequency);
  