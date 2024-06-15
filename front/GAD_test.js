function submitGAD7() {
    const form = document.getElementById('gad7-form');
    const formData = new FormData(form);
    let score = 0;
    let unanswered = false;
  
    for (let i = 1; i <= 7; i++) {
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
        message = '양호';
      } else if (score >= 5) {
        message = '불안 위험!';
      }
  
      // 여기서 서버로 점수를 전송하거나 DB에 저장할 수 있습니다.
      console.log('Total GAD-7 Score:', score);
  
      // 사용자가 확인을 누르면 main.html로 이동
      if (confirm('점수: ' + score + ' - ' + message)) {
        // 예시: fetch를 사용하여 서버로 데이터 전송
        fetch('/submit_gad7', {
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
  