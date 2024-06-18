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
  
  function loadCalendar(month = null, year = null) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();
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
  
        // 이전 달, 다음 달 버튼 이벤트 추가
        document.getElementById("prev-month").onclick = () => {
          const newDate = new Date(currentYear, currentMonth - 2); // 이전 달
          loadCalendar(newDate.getMonth() + 1, newDate.getFullYear());
        };
        document.getElementById("next-month").onclick = () => {
          const newDate = new Date(currentYear, currentMonth); // 다음 달
          loadCalendar(newDate.getMonth() + 1, newDate.getFullYear());
        };
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
          const date = new Date(activity.날짜);
          const day = date.getDate();
          const activityElement = document.createElement("div");
          activityElement.textContent = `${activity.활동명} : ${activity.활동시간}시간`;
  
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
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calendar").style.display = "none";
  });
  