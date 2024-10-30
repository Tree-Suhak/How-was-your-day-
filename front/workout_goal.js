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
function getMonday() {
    const serverDate = new Date(); // 서버의 현재 날짜를 가져옴 (여기서 서버 시간을 사용하는 것을 가정)
    const dayOfWeek = serverDate.getDay(); // 0(일요일) ~ 6(토요일) 범위의 요일을 반환

    // 월요일인 경우 그대로 반환하고, 화~일요일은 각각 차이를 계산해 월요일 날짜를 구함
    switch (dayOfWeek) {
        case 1: // 월요일
            return serverDate; // 현재 날짜 반환
        case 2: // 화요일
            serverDate.setDate(serverDate.getDate() - 1);
            break;
        case 3: // 수요일
            serverDate.setDate(serverDate.getDate() - 2);
            break;
        case 4: // 목요일
            serverDate.setDate(serverDate.getDate() - 3);
            break;
        case 5: // 금요일
            serverDate.setDate(serverDate.getDate() - 4);
            break;
        case 6: // 토요일
            serverDate.setDate(serverDate.getDate() - 5);
            break;
        case 0: // 일요일
            serverDate.setDate(serverDate.getDate() - 6);
            break;
        default:
            throw new Error("요일 정보가 잘못되었습니다.");
    }

    return serverDate;
}


function convertTimeToDecimal(hours, minutes) {
    const decimalTime = parseFloat(hours) + (parseInt(minutes) / 60).toFixed(2);
    switch (parseInt(minutes)) {
        case 5: return (parseFloat(hours) + 0.08).toFixed(2);
        case 10: return (parseFloat(hours) + 0.17).toFixed(2);
        case 15: return (parseFloat(hours) + 0.25).toFixed(2);
        case 20: return (parseFloat(hours) + 0.34).toFixed(2);
        case 25: return (parseFloat(hours) + 0.42).toFixed(2);
        case 30: return (parseFloat(hours) + 0.5).toFixed(2);
        case 35: return (parseFloat(hours) + 0.58).toFixed(2);
        case 40: return (parseFloat(hours) + 0.67).toFixed(2);
        case 45: return (parseFloat(hours) + 0.75).toFixed(2);
        case 50: return (parseFloat(hours) + 0.84).toFixed(2);
        case 55: return (parseFloat(hours) + 0.92).toFixed(2);
        default: return parseFloat(hours).toFixed(2);
    }
}

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
