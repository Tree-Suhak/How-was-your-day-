function submitCESD() {
    const form = document.getElementById('cesd-form');
    const formData = new FormData(form);
    let score = 0;
    let unanswered = false;
  
    for (let i = 1; i <= 20; i++) {
      const question = formData.get(`q${i}`);
      if (question === null) {
        unanswered = true;
        break;
      }
  
      // 4번, 8번, 12번, 16번 문항에 대한 특수 점수 계산
      if ([4, 8, 12, 16].includes(i)) {
        if (question === "0") score += 3;
        else if (question === "1") score += 2;
        else if (question === "2") score += 1;
        else if (question === "3") score += 0;
      } else {
        score += parseInt(question);
      }
    }
  
    if (unanswered) {
      alert('모든 문항에 답해주세요.');
    } else {
      let message = '';
      if (score >= 0 && score <= 15) {
        message = '정상';
      } else if (score >= 16 && score <= 20) {
        message = '약간 우울';
      } else if (score >= 21 && score <= 24) {
        message = '우울';
      } else if (score >= 25 && score <= 60) {
        message = '우울 위험!';
      }
  
      // 여기서 서버로 점수를 전송하거나 DB에 저장할 수 있습니다.
      console.log('Total CES-D Score:', score);
  
      // 사용자가 확인을 누르면 main.html로 이동
      if (confirm('CES-D 설문지가 제출되었습니다. 총 점수: ' + score + ' - ' + message)) {
        // 예시: fetch를 사용하여 서버로 데이터 전송
        fetch('/submit_cesd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ score, message })
        }).then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error('Error:', error));
  
        // main.html로 이동
        window.location.href = 'main.html';
      }
    }
  }
  