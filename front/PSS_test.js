function submitPSS() {
    const form = document.getElementById('pss-form');
    const formData = new FormData(form);
    let score = 0;
    let unanswered = false;
  
    for (let i = 1; i <= 10; i++) {
      const question = formData.get(`q${i}`);
      if (question === null) {
        unanswered = true;
        break;
      }
  
      // 4번, 5번, 7번, 8번 문항에 대한 특수 점수 계산
      if ([4, 5, 7, 8].includes(i)) {
        if (question === "0") score += 4;
        else if (question === "1") score += 3;
        else if (question === "2") score += 2;
        else if (question === "3") score += 1;
        else if (question === "4") score += 0;
      } else {
        score += parseInt(question);
      }
    }
  
    if (unanswered) {
      alert('모든 문항에 답해주세요.');
    } else {
      let message = '';
      if (score >= 0 && score <= 10) {
        message = '스트레스-양호';
      } else if (score >= 11 && score <= 20) {
        message = '스트레스-조심';
      } else if (score >= 21 && score <= 30) {
        message = '스트레스-위험';
      } else if (score >= 31 && score <= 40) {
        message = '스트레스-매우 위험!';
      }
  
      // 여기서 서버로 점수를 전송하거나 DB에 저장할 수 있습니다.
      console.log('Total PSS Score:', score);
  
      // 사용자가 확인을 누르면 main.html로 이동
      if (confirm('PSS 설문지가 제출되었습니다. 총 점수: ' + score + ' - ' + message)) {
        // 예시: fetch를 사용하여 서버로 데이터 전송
        fetch('/submit_pss', {
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
  