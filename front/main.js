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
            loadActivities(currentYear, currentMonth);
            loadPsychologicalTests(currentYear, currentMonth);
            attachMonthButtons(currentMonth);
        })
        .catch((error) => {
            console.error("Error loading the calendar:", error);
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
        .then((response) => response.json())
        .then((tests) => {
            tests.forEach((test) => {
                const date = new Date(test.date);
                const day = date.getDate();
                const testElement = document.createElement("div");
                testElement.textContent = `${test.test_type} : ${test.score}점`;

                const calendarDay = document.querySelector(
                    `.calendar-day[data-date="${day}"]`
                );
                if (calendarDay) {
                    calendarDay.appendChild(testElement);
                }
            });
        })
        .catch((error) => {
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
