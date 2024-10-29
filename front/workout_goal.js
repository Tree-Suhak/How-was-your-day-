document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const startDate = getMonday(today);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
  
    const goalPeriod = document.getElementById('goal-period');
    goalPeriod.textContent = `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 ~ ${endDate.getMonth() + 1}월 ${endDate.getDate()}일의 목표`;
  
    loadGoal();
});

// 월요일 기준 주 시작일 계산
function getMonday(d) {
    d = new Date(d);
    const day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1); // 일요일일 때 기준으로 정렬
    return new Date(d.setDate(diff));
}

function convertTimeToDecimal(hours, minutes) {
    const decimalTime = parseFloat(hours) + (parseInt(minutes) / 60).toFixed(2);
    switch (parseInt(minutes)) {
        case 10: return (parseFloat(hours) + 0.17).toFixed(2);
        case 20: return (parseFloat(hours) + 0.34).toFixed(2);
        case 30: return (parseFloat(hours) + 0.5).toFixed(2);
        case 40: return (parseFloat(hours) + 0.67).toFixed(2);
        case 50: return (parseFloat(hours) + 0.84).toFixed(2);
        default: return parseFloat(hours).toFixed(2); // 0분이거나 기본값
    }
}

function convertDecimalToTime(decimal) {
    const hours = Math.floor(decimal);
    const decimalPart = (decimal - hours).toFixed(2);
    let minutes = 0;

    if (decimalPart == 0.17) minutes = 10;
    else if (decimalPart == 0.34) minutes = 20;
    else if (decimalPart == 0.5) minutes = 30;
    else if (decimalPart == 0.67) minutes = 40;
    else if (decimalPart == 0.84) minutes = 50;

    return `${hours}시간 ${minutes}분`;
}

async function saveGoal() {
    const startDate = getMonday(new Date()).toISOString().slice(0, 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const goals = {
        exerciseGoal: checkAndGetGoal('exercise'),
        exerciseTime: checkAndGetTime('exercise'),
        meditationGoal: checkAndGetGoal('meditation'),
        meditationTime: checkAndGetTime('meditation'),
        readingGoal: checkAndGetGoal('reading'),
        readingTime: checkAndGetTime('reading'),
        hobbyGoal: checkAndGetGoal('hobby'),
        hobbyTime: checkAndGetTime('hobby'),
    };

    const response = await fetch('/save-goal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate: endDate.toISOString().slice(0, 10), goals }),
    });

    if (response.ok) {
        alert('목표가 저장되었습니다.');
        window.location.href = 'main.html';
    } else {
        alert('목표 저장에 실패했습니다.');
        window.location.href = 'main.html';
    }


}

function checkAndGetGoal(activity) {
    const goal = document.getElementById(`${activity}-goal`).value;
    const hours = document.getElementById(`${activity}-time-hours`).value;
    const minutes = document.getElementById(`${activity}-time-minutes`).value;

    // 목표가 비어있다면, 관련된 시간도 비어 있어야 함
    if (!goal) {
        // 시간이 비어 있어야 함
        document.getElementById(`${activity}-time-hours`).value = "";
        document.getElementById(`${activity}-time-minutes`).value = "";
        return "";
    }

    // goal이 입력되었는데, 시간이 0시간 0분이라면 둘 다 빈 문자열로 반환
    if (goal && (hours === "0" && minutes === "0")) {
        document.getElementById(`${activity}-time-hours`).value = "";
        document.getElementById(`${activity}-time-minutes`).value = "";
        return "";
    }
    return goal;
}

function checkAndGetTime(activity) {
    const goal = document.getElementById(`${activity}-goal`).value;
    const hours = document.getElementById(`${activity}-time-hours`).value;
    const minutes = document.getElementById(`${activity}-time-minutes`).value;

    // goal이 없거나 시간이 0시간 0분인 경우 빈 문자열 반환
    if (!goal || (hours === "0" && minutes === "0")) {
        return "";
    }
    if (!hours && !minutes) return "";
    return convertTimeToDecimal(hours || "0", minutes || "0");
}


async function loadGoal() {
    const response = await fetch('/get-goal');
    if (response.ok) {
        const currentGoal = await response.json();
        if (currentGoal) {
            setGoalValues('exercise', currentGoal.goals.exerciseGoal, currentGoal.goals.exerciseTime);
            setGoalValues('meditation', currentGoal.goals.meditationGoal, currentGoal.goals.meditationTime);
            setGoalValues('reading', currentGoal.goals.readingGoal, currentGoal.goals.readingTime);
            setGoalValues('hobby', currentGoal.goals.hobbyGoal, currentGoal.goals.hobbyTime);
        } else {
            alert('현재 설정된 목표가 없습니다.');
        }
    } else {
        alert('목표를 불러오지 못했습니다.');
    }
}

function setGoalValues(activity, goal, time) {
    document.getElementById(`${activity}-goal`).value = goal || "";
    if (time) {
        const [hours, minutes] = convertDecimalToTime(time).split('시간 ');
        document.getElementById(`${activity}-time-hours`).value = hours || "";
        document.getElementById(`${activity}-time-minutes`).value = minutes.replace("분", "") || "";
    }
}
