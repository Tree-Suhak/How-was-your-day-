function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 사용자 검증
    let uid = "";
    if (username === "admin" && password === "admin") {
        uid = "U0001"; // 예시 관리자 UID
    } else if (username === "user" && password === "password") {
        uid = "U0002"; // 예시 일반 사용자 UID
    }

    if (uid) {
        localStorage.setItem("uid", uid); // UID를 로컬 스토리지에 저장
        document.getElementById("login").style.display = "none";
        document.getElementById("calendar").style.display = "block";
        loadCalendar();
    } else {
        alert("Invalid username or password");
    }
}

async function saveDiary() {
    const date = document.getElementById("diary-date").value;
    const content = document.getElementById("diary-content").value;
  
    if (!date || !content) {
      alert("Date and content are required");
      return;
    }
  
    const response = await fetch("/save-diary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, content }),
    });
  
    const result = await response.json();
  
    if (result.success) {
      alert("일기가 저장되었습니다.");
      window.location.href = "main.html"; // 메인 페이지로 이동
    } else {
      alert("일기 저장에 실패했습니다.");
      window.location.href = "main.html"; // 메인 페이지로 이동
    }
  }
  
function loadCalendar(month = null) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = month || now.getMonth() + 1;
    let monthFile = "";

    switch (currentMonth) {
        case 1:
            monthFile = "january.html";
            break;
        case 2:
            monthFile = "february.html";
            break;
        case 3:
            monthFile = "march.html";
            break;
        case 4:
            monthFile = "april.html";
            break;
        case 5:
            monthFile = "may.html";
            break;
        case 6:
            monthFile = "june.html";
            break;
        case 7:
            monthFile = "july.html";
            break;
        case 8:
            monthFile = "august.html";
            break;
        case 9:
            monthFile = "september.html";
            break;
        case 10:
            monthFile = "october.html";
            break;
        case 11:
            monthFile = "november.html";
            break;
        case 12:
            monthFile = "december.html";
            break;
    }

    fetch(`calendar/${monthFile}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then((data) => {
            document.getElementById("calendar").innerHTML = data;
            loadEmotions(currentYear, currentMonth);  // 이 부분에서 감정 데이터를 불러옴
            loadActivities(currentYear, currentMonth);
            loadPsychologicalTests(currentYear, currentMonth);
            attachMonthButtons(currentMonth);
        })
        .catch((error) => {
            console.error("Error loading the calendar:", error);
        });
}

function loadEmotions(year, month) {
    const uid = localStorage.getItem("uid");

    // 한국어 감정을 영어로 변환하는 매핑 객체
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

    fetch(`/get-emotions?year=${year}&month=${month}&uid=${uid}`)
        .then((response) => response.json())
        .then((emotions) => {
            emotions.forEach((emotion) => {
                const date = new Date(emotion.날짜);
                const day = date.getDate();
                const calendarDay = document.querySelector(
                    `.calendar-day[data-date="${day}"]`
                );
                
                if (calendarDay) {
                    const emojiName = emotionMap[emotion.EMOJI] || 'default';  // 감정을 영어로 변환, 없으면 'default'

                    const emojiElement = document.createElement("img");
                    emojiElement.src = `../emoji/${emojiName}.png`;  // 변환된 영어 감정명으로 이미지 경로 설정
                    emojiElement.style.width = "20px";  // 작은 크기로 설정
                    emojiElement.style.height = "20px";
                    emojiElement.style.position = "absolute";
                    emojiElement.style.top = "5px";
                    emojiElement.style.right = "5px";
                    calendarDay.style.position = "relative";  // 부모 요소의 위치를 상대적으로 설정
                    calendarDay.appendChild(emojiElement);  // 이모티콘을 달력에 추가
                }
            });
        })
        .catch((error) => {
            console.error("Error loading emotions:", error);
        });
}


function loadActivities(year, month) {
    const uid = localStorage.getItem("uid"); // 로컬 스토리지에서 UID 가져오기

    fetch(`/get-activities?year=${year}&month=${month}&uid=${uid}`)
        .then((response) => response.json())
        .then((activities) => {
            activities.forEach((activity) => {
                const date = new Date(activity.date);
                const day = date.getDate();
                const activityElement = document.createElement("div");
                activityElement.textContent = `${activity.activity_name} : ${activity.hours}시간`;

                const calendarDay = document.querySelector(
                    `.calendar-day[data-date="${day}"]`
                );
                if (calendarDay) {
                    calendarDay.appendChild(activityElement);
                }
            });
        })
        .catch((error) => {
            console.error("Error loading activities:", error);
        });
}

function loadPsychologicalTests(year, month) {
    const uid = localStorage.getItem("uid");
  
    fetch(`/get-psychological-tests?year=${year}&month=${month}&uid=${uid}`)
      .then(response => response.json())
      .then(tests => {
        tests.forEach(test => {
          const date = new Date(test.date);
          const day = date.getDate();
          const calendarDay = document.querySelector(`.calendar-day[data-date="${day}"]`);
          
          if (calendarDay) {
            Object.keys(test).forEach(key => {
              if (key !== "date") {
                const testElement = document.createElement("div");
                testElement.className = "psychological-test"; // 기본 클래스
                testElement.textContent = `${key} : ${test[key]}`;
  
                // 위험 이상의 평가일 경우 빨간 글씨
                if (test[key].includes("위험") || test[key].includes("불안증세")) {
                    testElement.classList.add("danger");
                }
  
                calendarDay.appendChild(testElement);
              }
            });
          }
        });
      })
      .catch(error => {
        console.error("Error loading psychological tests:", error);
      });
  }
  

function attachMonthButtons(currentMonth) {
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");

    if (prevMonthButton) {
        prevMonthButton.addEventListener("click", () => {
            const prevMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
            loadCalendar(prevMonth);
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener("click", () => {
            const nextMonth = currentMonth + 1 === 13 ? 1 : currentMonth + 1;
            loadCalendar(nextMonth);
        });
    }
}

function checkLoginStatus() {
    const uid = localStorage.getItem("uid");
    if (uid) {
        document.getElementById("login").style.display = "none";
        document.getElementById("calendar").style.display = "block";
        loadCalendar();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});


///////////////////////// 주 목표 찾아오기 ////////////////////////////////

// 시간 값을 소수점 시간으로 변환하는 함수 (주어진 규칙대로 변환)
function convertTimeToDecimal(hours, minutes) {
    const hourDecimal = parseInt(hours, 10);
    const minuteToHour = {
        "5": 0.08, "10": 0.17, "15": 0.25, "20": 0.34, "25": 0.42,
        "30": 0.5, "35": 0.58, "40": 0.67, "45": 0.75, "50": 0.84, "55": 0.92
    };
    return hourDecimal + (minuteToHour[minutes] || 0);
}

// 소수점 시간 값을 '시간 분' 형식으로 변환하는 함수
function convertDecimalToTime(decimal) {
    const hours = Math.floor(decimal);
    const decimalPart = (decimal - hours).toFixed(2);
    let minutes = 0;

    if (decimalPart == 0.08) minutes = 5;
    else if (decimalPart == 0.17) minutes = 10;
    else if (decimalPart == 0.25) minutes = 15;
    else if (decimalPart == 0.34) minutes = 20;
    else if (decimalPart == 0.42) minutes = 25;
    else if (decimalPart == 0.5) minutes = 30;
    else if (decimalPart == 0.58) minutes = 35;
    else if (decimalPart == 0.67) minutes = 40;
    else if (decimalPart == 0.75) minutes = 45;
    else if (decimalPart == 0.84) minutes = 50;
    else if (decimalPart == 0.92) minutes = 55;

    return `${hours}시간 ${minutes}분`;
}

// 목표 달성도 계산 함수
function calculateGoalAchievement(goals, actuals) {
    let n = 0;
    let exerciseAchieved = 0, meditationAchieved = 0, readingAchieved = 0, hobbyAchieved = 0;

    // 목표 시간 계산
    const exerciseGoalHours = convertTimeToDecimal(goals.exerciseTimeHours, goals.exerciseTimeMinutes);
    const meditationGoalHours = convertTimeToDecimal(goals.meditationTimeHours, goals.meditationTimeMinutes);
    const readingGoalHours = convertTimeToDecimal(goals.readingTimeHours, goals.readingTimeMinutes);
    const hobbyGoalHours = convertTimeToDecimal(goals.hobbyTimeHours, goals.hobbyTimeMinutes);

    n = (exerciseGoalHours * goals.exerciseGoal) +
        (meditationGoalHours * goals.meditationGoal) +
        (readingGoalHours * goals.readingGoal) +
        (hobbyGoalHours * goals.hobbyGoal);

    // 실제 기록된 활동 시간과 목표 비교
    if (n > 0) {
        // 운동 퍼센트 계산
        exerciseAchieved = Math.min((actuals.exerciseTotal / (exerciseGoalHours * goals.exerciseGoal)) * 100, 100);
        // 명상 퍼센트 계산
        meditationAchieved = Math.min((actuals.meditationTotal / (meditationGoalHours * goals.meditationGoal)) * 100, 100);
        // 독서 퍼센트 계산
        readingAchieved = Math.min((actuals.readingTotal / (readingGoalHours * goals.readingGoal)) * 100, 100);
        // 취미 퍼센트 계산
        hobbyAchieved = Math.min((actuals.hobbyTotal / (hobbyGoalHours * goals.hobbyGoal)) * 100, 100);
    }

    // 전체 달성 퍼센트 계산
    return Math.round((exerciseAchieved + meditationAchieved + readingAchieved + hobbyAchieved) / 4);
}

// 주간 목표 데이터를 로드하는 함수
async function loadWeeklyGoals() {
    const response = await fetch('/get-goal');
    if (response.ok) {
        const weeklyGoals = await response.json();
        return weeklyGoals ? weeklyGoals.goals : null;
    }
    return null;
}

// 막대 그래프 생성 및 업데이트 함수
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('goal-progress');
    const achievementPercentage = document.getElementById('achievement-percentage');
    
    if (progressBar && achievementPercentage) {
        progressBar.style.width = `${percentage}%`;
        achievementPercentage.textContent = `${percentage}%`;
    } else {
        console.error('Progress bar element or achievement percentage element not found');
    }
}

// 목표 데이터를 불러와서 계산 후 막대 그래프에 반영
async function showWeeklyGoalAchievement() {
    const weeklyGoals = await loadWeeklyGoals();
    if (!weeklyGoals) {
        console.error("No weekly goals found.");
        return;
    }

    // 실제 활동 데이터를 가져와서 목표와 비교 (여기서는 예시로 임의의 실제 활동 시간을 넣었습니다)
    const actuals = {
        exerciseTotal: 2.5, // 실제 운동 총 시간 (예시 데이터)
        meditationTotal: 1.2, // 실제 명상 총 시간 (예시 데이터)
        readingTotal: 1.0, // 실제 독서 총 시간 (예시 데이터)
        hobbyTotal: 0 // 실제 취미 총 시간 (예시 데이터)
    };

    const percentage = calculateGoalAchievement(weeklyGoals, actuals);
    updateProgressBar(percentage);
}

// 페이지 로드 시 위험 메시지 표시 함수
async function checkDangerAlerts() {

    const uid = localStorage.getItem("uid");
    console.log(uid);
    if (!uid) return;

    try {
      // 위험 설정 값 불러오기
      const alertSettingsResponse = await fetch('/get-alert-settings');
      const alertSettings = await alertSettingsResponse.json();
      
  
      // 최근 2주간 검사 결과 불러오기
      const testResultsResponse = await fetch(`/get-recent-test-results?uid=${uid}`);
      if (!testResultsResponse.ok) {
        console.error('Failed to fetch test results');
        return;
      }
      const testResults = await testResultsResponse.json();
  
      // 위험 횟수 계산: 초기화 후 수치 이상이면 1씩 증가
      const dangerCounts = {
        PHQ: 0,
        GAD: 0,
        CES: 0,
        PSS: 0
      };
  
      testResults.forEach(result => {
        if (result.PHQ_9점수 >= 10) dangerCounts.PHQ++;
        if (result.GAD_7점수 >= 5) dangerCounts.GAD++;
        if (result.통합적_한국판_우울증_척도_점수 >= 21) dangerCounts.CES++;
        if (result.한국형_스트레스_자가척도_점수 >= 20) dangerCounts.PSS++;
      });
  
      // 위험 기준과 비교하여 메시지 표시
      if (
        (dangerCounts.PHQ >= alertSettings.PHQ) ||
        (dangerCounts.GAD >= alertSettings.GAD) ||
        (dangerCounts.CES >= alertSettings.CES) ||
        (dangerCounts.PSS >= alertSettings.PSS)
      ) {
        document.getElementById('danger-message').classList.remove('hidden');
        document.getElementById('danger-message').textContent = 
          "우울 위험 감지되었습니다. 당신의 주의가 필요합니다. 필요하시다면, 전문기관과 주변의 도움을 받아보세요.";
      }
    } catch (error) {
      console.error('Error checking danger alerts:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    console.log("Fetching recent test results with UID:", uid); // 여기에 UID가 표시되는지 확인

    // UID가 제대로 불러와지지 않으면 경고 메시지
    if (!uid) {
        console.warn("UID가 설정되지 않았습니다.");
        return;
    }

    // UID가 제대로 불러와졌다면 계속해서 로직 실행
    checkDangerAlerts();
});

  // 페이지 로드 시 실행
  document.addEventListener('DOMContentLoaded', () => {
    checkDangerAlerts();
  });


// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', showWeeklyGoalAchievement);
