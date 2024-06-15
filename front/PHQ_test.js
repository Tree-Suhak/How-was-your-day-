function submitPHQ9() {
    const form = document.getElementById('phq9-form');
    const formData = new FormData(form);
    let score = 0;
    let unanswered = false;
  
    for (let i = 1; i <= 10; i++) {
      const question = formData.get(`q${i}`);
      if (question === null) {
        unanswered = true;
        break;
      }
      score += parseInt(question);
    }
  
    if (unanswered) {
      alert('모든 문항에 답해주세요.');
    } else {
      let message = '';
      if (score >= 0 && score <= 4) {
        message = '매우 양호';
      } else if (score >= 5 && score <= 9) {
        message = '양호';
      } else if (score >= 10 && score <= 19) {
        message = '위험!';
      } else if (score >= 20 && score <= 27) {
        message = '매우 위험!';
      }
  
      // 여기서 서버로 점수를 전송하거나 DB에 저장할 수 있습니다.
      console.log('Total PHQ-9 Score:', score);
  
      // 사용자가 확인을 누르면 main.html로 이동
      if (confirm('PHQ-9 설문지가 제출되었습니다. 총 점수: ' + score + ' - ' + message)) {
        // 예시: fetch를 사용하여 서버로 데이터 전송
        fetch('/submit_phq9', {
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
  