async function submitActivity() {
    const form = document.getElementById("activity-form");
    const formData = new FormData(form);
    const activities = formData.getAll("activity");
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식의 오늘 날짜
  
    const activityData = activities.map((activity) => {
      const hours = document.getElementById(`${activity}-hours`).value || 0;
      const minutes = document.getElementById(`${activity}-minutes`).value || 0;
      const time = parseFloat(hours) + parseFloat(minutes) / 60;
      return {
        name: activity,
        time: time,
      };
    });
  
    try {
      const response = await fetch("/save-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, activities: activityData }),
      });
  
      if (response.ok) {
        window.close(); // 창 닫기
        window.opener.location.reload(); // 부모 창 새로고침
      } else {
        console.error("Error saving activity:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  }
  