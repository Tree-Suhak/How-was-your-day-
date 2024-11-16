/* 
서버 내용 순서
1. DB 연결 및 생성
2. 일기
3. 감정 - 이모티콘(오늘의 감정, 이번달의 감정)
4. 활동 정보
5. 활동 목표
6. 자가 검진
7. 자가검진 위험도 설정
8. 커뮤니티
*/

const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../front")));
app.use('/emoji', express.static(path.join(__dirname, '../emoji')));
app.use('/data', express.static(path.join(__dirname, '../data')));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "HowWasYourDay"
});


// DB 연결
db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected...");

  db.query("CREATE DATABASE IF NOT EXISTS HowWasYourDay", (err, result) => {
    if (err) throw err;
    console.log("Database created or already exists");
  });

  db.query("USE HowWasYourDay", (err, result) => {
    if (err) throw err;
    console.log("Using HowWasYourDay database");

    const createCustomerTable = `
      CREATE TABLE IF NOT EXISTS 고객 (
        UID CHAR(5) PRIMARY KEY,
        이름 VARCHAR(20),
        생년월일 INT
      )
    `;
    db.query(createCustomerTable, (err, result) => {
      if (err) throw err;
      console.log("고객 table created or already exists");
    });

    const createStatusTable = `
      CREATE TABLE IF NOT EXISTS 상태정보 (
        SID CHAR(5) PRIMARY KEY,
        UID CHAR(5),
        날짜 DATE,
        PHQ_9점수 INT,
        GAD_7점수 INT,
        통합적_한국판_우울증_척도_점수 INT,
        한국형_스트레스_자가척도_점수 INT,
        FOREIGN KEY (UID) REFERENCES 고객(UID)
      )
    `;
    db.query(createStatusTable, (err, result) => {
      if (err) throw err;
      console.log("상태정보 table created or already exists");
    });

    const createActivityTable = `
      CREATE TABLE IF NOT EXISTS 활동정보 (
        AID VARCHAR(10) PRIMARY KEY,
        UID CHAR(5),
        날짜 DATE,
        활동명 CHAR(20),
        활동시간 INT,
        FOREIGN KEY (UID) REFERENCES 고객(UID)
      )
    `;
    db.query(createActivityTable, (err, result) => {
      if (err) throw err;
      console.log("활동정보 table created or already exists");
    });

    const createEmotionTable = `
      CREATE TABLE IF NOT EXISTS 기분 (
        EID CHAR(5) PRIMARY KEY,
        UID CHAR(5),
        날짜 DATE,
        EMOJI VARCHAR(20),
        FOREIGN KEY (UID) REFERENCES 고객(UID)
      )
    `;
    db.query(createEmotionTable, (err, result) => {
      if (err) throw err;
      console.log("기분 table created or already exists");
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../front", "main.html"));
});


//////////////////////////////////////// 일기 //////////////////////////

// 다이어리 저장 기능
app.post("/save-diary", (req, res) => {
  const { date, entry, uid } = req.body;
  const currentTime = new Date();
  const id = `d${currentTime.getFullYear()}${(currentTime.getMonth() + 1).toString().padStart(2, '0')}${currentTime.getDate().toString().padStart(2, '0')}${currentTime.getHours().toString().padStart(2, '0')}${currentTime.getMinutes().toString().padStart(2, '0')}${currentTime.getSeconds().toString().padStart(2, '0')}`;

  if (!date || !entry) {
      return res.status(400).json({ success: false, message: "Invalid input data" });
  }

  const filePath = path.join(__dirname, "../data/diaries.json");

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          if (err.code === 'ENOENT') {
              const diaries = [];
              const newDiary = { id, uid, date, content: entry };
              diaries.push(newDiary);

              fs.writeFile(filePath, JSON.stringify(diaries, null, 2), (writeErr) => {
                  if (writeErr) {
                      console.error("Error saving diary:", writeErr);
                      return res.status(500).json({ success: false, message: "Failed to save diary" });
                  }
                  res.json({ success: true });
              });
          } else {
              console.error("Error reading diaries:", err);
              return res.status(500).json({ success: false, message: "Failed to read diaries" });
          }
      } else {
          let diaries;
          try {
              diaries = JSON.parse(data);
          } catch (parseErr) {
              console.error("Error parsing diaries:", parseErr);
              return res.status(500).json({ success: false, message: "Failed to parse diaries" });
          }

          const newDiary = { id, uid, date, content: entry };
          diaries.push(newDiary);

          fs.writeFile(filePath, JSON.stringify(diaries, null, 2), (writeErr) => {
              if (writeErr) {
                  console.error("Error saving diary:", writeErr);
                  return res.status(500).json({ success: false, message: "Failed to save diary" });
              }
              res.json({ success: true });
          });
      }
  });
});


// 일기 삭제
app.post('/delete-diaries', (req, res) => {
  const { ids } = req.body;
  const filePath = path.join(__dirname, "../data/diaries.json");

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading diaries:", err);
          return res.status(500).json({ success: false, message: "Failed to read diaries" });
      }

      let diaries = JSON.parse(data);
      diaries = diaries.filter(diary => !ids.includes(diary.id));

      fs.writeFile(filePath, JSON.stringify(diaries, null, 2), (err) => {
          if (err) {
              console.error("Error deleting diaries:", err);
              return res.status(500).json({ success: false, message: "Failed to delete diaries" });
          }
          res.json({ success: true });
      });
  });
});


// 일기 수정
app.post('/edit-diary/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const filePath = path.join(__dirname, "../data/diaries.json");

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading diaries:", err);
          return res.status(500).json({ success: false, message: "Failed to read diaries" });
      }

      let diaries = JSON.parse(data);
      const diaryIndex = diaries.findIndex(diary => diary.id === id);
      if (diaryIndex === -1) {
          return res.status(404).json({ success: false, message: "Diary not found" });
      }

      diaries[diaryIndex].content = content;

      fs.writeFile(filePath, JSON.stringify(diaries, null, 2), (err) => {
          if (err) {
              console.error("Error editing diary:", err);
              return res.status(500).json({ success: false, message: "Failed to edit diary" });
          }
          res.json({ success: true });
      });
  });
});

// 일기 가져오기
app.get('/get-diaries', (req, res) => {
  const filePath = path.join(__dirname, '../data/diaries.json');
  
  fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
          console.error('Error loading diaries:', err);
          return res.status(500).json({ success: false, message: 'Failed to load diaries' });
      }
      
      const diaries = JSON.parse(data);
      res.json(diaries);
  });
});

// id에 따른 일기 가져오기
app.get('/get-diary/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(__dirname, '../data/diaries.json');
  
  fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
          console.error('Error loading diary:', err);
          return res.status(500).json({ success: false, message: 'Failed to load diary' });
      }
      
      const diaries = JSON.parse(data);
      const diary = diaries.find(d => d.id === id);
      
      if (diary) {
          res.json(diary);
      } else {
          res.status(404).json({ success: false, message: 'Diary not found' });
      }
  });
});


//////////////////////////////////////////////감정///////////////////////////////////////////////

// 감정 빈도 확인
app.get("/emotion-frequency", (req, res) => {
    const { uid, year, month } = req.query;
  
    const query = `
      SELECT EMOJI, COUNT(*) AS count
      FROM 기분
      WHERE UID = ? AND YEAR(날짜) = ? AND MONTH(날짜) = ?
      GROUP BY EMOJI
      ORDER BY count DESC
    `;
  
    db.query(query, [uid, year, month], (err, results) => {
      if (err) {
        console.error("Error fetching emotion frequency:", err);
        return res.status(500).json({ success: false, message: "데이터베이스 오류" });
      }
      res.json(results);
    });
});
  

// 감정 저장
app.post("/save-emotion", (req, res) => {
  const { date, emoji } = req.body;
  const uid = req.body.uid || "U0001"; // 실제로는 로그인된 사용자 정보를 사용

  // 동일 날짜에 이미 이모지가 저장되었는지 확인
  const checkQuery = "SELECT * FROM 기분 WHERE UID = ? AND 날짜 = ?";
  db.query(checkQuery, [uid, date], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // 이미 이모지가 저장된 경우
      return res.json({ success: false, message: "이미 이모지를 등록했습니다." });
    } else {
      // 이모지가 저장되지 않은 경우
      db.query("SELECT MAX(CAST(SUBSTRING(EID, 2) AS UNSIGNED)) AS maxId FROM 기분", (err, results) => {
        if (err) throw err;
        const nextId = results[0].maxId ? results[0].maxId + 1 : 1;
        const eid = `E${String(nextId).padStart(4, "0")}`;

        const insertQuery = "INSERT INTO 기분 (EID, UID, 날짜, EMOJI) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [eid, uid, date, emoji], (err, result) => {
          if (err) {
            console.error("Error saving emotion:", err);
            return res.json({ success: false });
          }
          res.json({ success: true });
        });
      });
    }
  });
});


// 감정 불러오기
app.get("/get-emotions", (req, res) => {
  const { year, month, uid } = req.query;

  const query = `
    SELECT 날짜, EMOJI
    FROM 기분
    WHERE UID = ? AND YEAR(날짜) = ? AND MONTH(날짜) = ?
  `;
  
  db.query(query, [uid, year, month], (err, results) => {
    if (err) {
      console.error("Error fetching emotions:", err);
      return res.status(500).json({ success: false, message: "데이터베이스 오류" });
    }
    res.json(results);  // 감정 데이터를 클라이언트에 반환
  });
});


///////////////////////////////////////////////////// 활동 정보 ///////////////////////////////////////


// 활동 정보 가져오기
app.get("/get-activities", (req, res) => {
  const { year, month, uid } = req.query;
  const query = "SELECT * FROM 활동정보 WHERE YEAR(날짜) = ? AND MONTH(날짜) = ? AND UID = ?";
  db.query(query, [year, month, uid], (err, results) => {
    if (err) {
      console.error("Error fetching activities:", err);
      return res.json([]);
    }
    res.json(results);
  });
});

// 활동 정보 저장하기
app.post("/save-activity", (req, res) => {
  const { uid, date, activities } = req.body;

  console.log("Received UID:", uid);
  console.log("Received date:", date);
  console.log("Received activities:", activities);

  // UID가 존재하는지 확인
  if (!uid) {
    return res.status(400).json({ success: false, message: "UID is missing" });
  }

  // 각 활동에 대해 데이터베이스에 저장
  activities.forEach((activity) => {
    const activityMap = {
      "운동": "E",
      "명상": "M",
      "독서": "R",
      "취미": "H",
    };

    // 날짜를 "YYYYMMDD" 형식으로 변환
    const formattedDate = date.replace(/-/g, "");
    const activityInitial = activityMap[activity.name] || "X";
    const aid = `A${formattedDate}${activityInitial}`;

    // 활동 정보가 있으면 업데이트, 없으면 새로 삽입
    const query = `
      INSERT INTO 활동정보 (AID, UID, 날짜, 활동명, 활동시간)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 활동시간 = VALUES(활동시간)`;

    db.query(query, [aid, uid, date, activity.name, activity.time], (err, result) => {
      if (err) {
        console.error("Error saving activity:", err);
        return res.status(500).json({ success: false, message: "Error saving activity" });
      }
    });
  });

  res.json({ success: true, message: "All activities saved successfully" });
});


///////////////////////////////////////////// 활동 목표 ////////////////////////////////////////////

// 주간 목표 저장
app.post('/save-goal', (req, res) => {
  const { goals, startDate, endDate } = req.body; // 클라이언트에서 받은 목표 데이터
  const filePath = path.join(__dirname, '../data/weekly_goals.json'); // 목표를 저장할 파일 경로

  // 파일에 목표 저장
  fs.readFile(filePath, 'utf-8', (err, data) => {
      let goalData = [];

      if (!err && data) {
          try {
              goalData = JSON.parse(data); // 기존 데이터를 파싱
          } catch (parseErr) {
              console.error('Error parsing weekly_goals.json:', parseErr);
              return res.status(500).json({ success: false, message: '데이터 파싱 오류' });
          }
      }

      // 기존 목표가 있는지 확인
      const existingGoalIndex = goalData.findIndex(goal => goal.startDate === startDate && goal.endDate === endDate);
      
      if (existingGoalIndex > -1) {
          // 기존 목표가 있는 경우, 업데이트
          goalData[existingGoalIndex].goals = goals;
      } else {
          // 기존 목표가 없는 경우, 새 목표 추가
          goalData.push({ startDate, endDate, goals });
      }

      // 업데이트된 목표 데이터를 파일에 저장
      fs.writeFile(filePath, JSON.stringify(goalData, null, 2), (writeErr) => {
          if (writeErr) {
              console.error('Error saving goals:', writeErr);
              return res.status(500).json({ success: false, message: '목표 저장 실패' });
          }
          res.json({ success: true, message: '목표가 저장되었습니다.' });
      });
  });
});


// 주간 목표 불러오기
app.get('/get-goal', (req, res) => {
  const filePath = path.join(__dirname, '../data/weekly_goals.json');
  const currentDate = new Date();

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error loading goals:', err);
      return res.status(500).json({ success: false, message: '목표 불러오기 실패' });
    }

    const goals = JSON.parse(data);
    const currentGoal = goals.find(goal => {
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      return currentDate >= start && currentDate <= end;
    });

    if (currentGoal) {
      res.json(currentGoal);
    } else {
      res.json(null);
    }
  });
});

// 비교해서 메인 화면에 % 띄우기

// 목표 저장 API
app.post('/save-goal', (req, res) => {
  const { startDate, endDate, goals } = req.body;
  const uid = req.session.uid; // 사용자 세션 정보 사용

  // 목표 정보를 DB에 저장
  const query = `
      INSERT INTO weekly_goals (uid, start_date, end_date, exercise_goal, exercise_time, meditation_goal, meditation_time, reading_goal, reading_time, hobby_goal, hobby_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
          exercise_goal = VALUES(exercise_goal), 
          exercise_time = VALUES(exercise_time),
          meditation_goal = VALUES(meditation_goal),
          meditation_time = VALUES(meditation_time),
          reading_goal = VALUES(reading_goal),
          reading_time = VALUES(reading_time),
          hobby_goal = VALUES(hobby_goal),
          hobby_time = VALUES(hobby_time);
  `;

  db.query(query, [uid, startDate, endDate, goals.exerciseGoal, goals.exerciseTime, goals.meditationGoal, goals.meditationTime, goals.readingGoal, goals.readingTime, goals.hobbyGoal, goals.hobbyTime], (err) => {
      if (err) {
          console.error("목표 저장 오류:", err);
          return res.status(500).json({ success: false, message: '서버 오류' });
      }
      res.json({ success: true });
  });
});

// 주간 목표 데이터 제공
app.get('/data/weekly_goals.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../data/weekly_goals.json'));
});


//////////////////////////////////////////////// 자가 검진 //////////////////////////////////////////////

// 테스트 점수 평가
function evaluateScore(testType, score) {
  switch (testType) {
    case "PHQ_9점수":
      if (score <= 4) return "정상";
      if (score <= 9) return "가벼움";
      if (score <= 19) return "위험";
      return "매우 위험";
    case "통합적_한국판_우울증_척도_점수":
      if (score <= 15) return "정상";
      if (score <= 20) return "가벼움";
      if (score <= 24) return "위험";
      return "매우 위험";
    case "GAD_7점수":
      return score >= 5 ? "증세 있음" : "정상";
    case "한국형_스트레스_자가척도_점수":
      return `${score}(40점 만점)`;
    default:
      return "";
  }
}

// 자가 검진 저장
app.post("/save-test-result", (req, res) => {
  const { uid, date, testType, score } = req.body;

  // 검사 결과가 이미 존재하는지 확인
  const checkQuery = `
    SELECT PHQ_9점수, GAD_7점수, 통합적_한국판_우울증_척도_점수, 한국형_스트레스_자가척도_점수
    FROM 상태정보
    WHERE UID = ? AND 날짜 = ?
  `;

  db.query(checkQuery, [uid, date], (err, results) => {
    if (err) {
      console.error("Error checking existing test results:", err);
      return res.json({ success: false, message: "서버 오류가 발생했습니다." });
    }

    if (results.length > 0) {
      const existingTest = results[0];

      // 해당 검사 점수가 이미 존재하는지 확인
      let isAlreadyTested = false;
      switch (testType) {
        case "PHQ_9점수":
          isAlreadyTested = existingTest.PHQ_9점수 !== -1;
          break;
        case "GAD_7점수":
          isAlreadyTested = existingTest.GAD_7점수 !== -1;
          break;
        case "통합적_한국판_우울증_척도_점수":
          isAlreadyTested = existingTest.통합적_한국판_우울증_척도_점수 !== -1;
          break;
        case "한국형_스트레스_자가척도_점수":
          isAlreadyTested = existingTest.한국형_스트레스_자가척도_점수 !== -1;
          break;
        default:
          return res.json({ success: false, message: "잘못된 검사 유형입니다." });
      }

      // 검사 결과가 이미 있는 경우
      if (isAlreadyTested) {
        return res.json({ success: false, message: "오늘 이미 검사를 하였습니다." });
      }

      // 검사 결과 업데이트
      const updateQuery = `
        UPDATE 상태정보
        SET ${testType} = ?
        WHERE UID = ? AND 날짜 = ?
      `;

      db.query(updateQuery, [score, uid, date], (err, result) => {
        if (err) {
          console.error("Error updating test result:", err);
          return res.json({ success: false, message: "검사 결과 업데이트에 실패했습니다." });
        }
        return res.json({ success: true, message: "검사 결과가 업데이트되었습니다." });
      });
    } else {
      // 해당 날짜의 결과가 없으면 새로 삽입
      db.query("SELECT MAX(CAST(SUBSTRING(SID, 2) AS UNSIGNED)) AS maxId FROM 상태정보", (err, results) => {
        if (err) {
          console.error("Error generating SID:", err);
          return res.json({ success: false, message: "SID 생성에 실패했습니다." });
        }

        const nextId = results[0].maxId ? results[0].maxId + 1 : 1;
        const sid = `S${String(nextId).padStart(4, "0")}`;

        const insertQuery = `
          INSERT INTO 상태정보 (SID, UID, 날짜, PHQ_9점수, GAD_7점수, 통합적_한국판_우울증_척도_점수, 한국형_스트레스_자가척도_점수)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // 초기 값을 -1로 설정하고 해당 검사 점수만 업데이트
        const values = [sid, uid, date, -1, -1, -1, -1];
        if (testType === "PHQ_9점수") values[3] = score;
        else if (testType === "GAD_7점수") values[4] = score;
        else if (testType === "통합적_한국판_우울증_척도_점수") values[5] = score;
        else if (testType === "한국형_스트레스_자가척도_점수") values[6] = score;

        db.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error("Error saving test result:", err);
            return res.json({ success: false, message: "검사 결과 저장에 실패했습니다." });
          }
          res.json({ success: true, message: "검사 결과가 저장되었습니다." });
        });
      });
    }
  });
});




// 자가검진 결과 가져오기
app.get("/get-psychological-tests", (req, res) => {
  const { year, month, uid } = req.query;
  const query = `
    SELECT 날짜, PHQ_9점수, GAD_7점수, 통합적_한국판_우울증_척도_점수, 한국형_스트레스_자가척도_점수
    FROM 상태정보
    WHERE YEAR(날짜) = ? AND MONTH(날짜) = ? AND UID = ?
  `;

  db.query(query, [year, month, uid], (err, results) => {
    if (err) {
      console.error("Error fetching psychological tests:", err);
      return res.json([]);
    }

    const formattedResults = results.map(result => {
      const formattedResult = { date: result.날짜 };
      if (result.PHQ_9점수 !== -1) {
        formattedResult["우울(P)"] = `${evaluateScore("PHQ_9점수", result.PHQ_9점수)}(${result.PHQ_9점수})`;
      }
      if (result.GAD_7점수 !== -1) {
        formattedResult["불안"] = `${evaluateScore("GAD_7점수", result.GAD_7점수)}(${result.GAD_7점수})`;
      }
      if (result.통합적_한국판_우울증_척도_점수 !== -1) {
        formattedResult["우울(C)"] = `${evaluateScore("통합적_한국판_우울증_척도_점수", result.통합적_한국판_우울증_척도_점수)}(${result.통합적_한국판_우울증_척도_점수})`;
      }
      if (result.한국형_스트레스_자가척도_점수 !== -1) {
        formattedResult["스트레스"] = `${result.한국형_스트레스_자가척도_점수}/40`;
      }
      return formattedResult;
    });

    res.json(formattedResults);
  });
});

///////////////////////////// 자가 검진 위험도 설정 /////////////////////////////////////


app.post('/save-alert-settings', (req, res) => {
  const settings = req.body;
  const filePath = path.join(__dirname, '../data/alert_settings.json');

  fs.writeFile(filePath, JSON.stringify(settings, null, 2), (err) => {
      if (err) {
          console.error('Error saving alert settings:', err);
          return res.status(500).json({ success: false, message: '설정 저장 실패' });
      }
      res.json({ success: true, message: '설정이 저장되었습니다.' });
  });
});

// 위험 설정 값 불러오기
app.get('/get-alert-settings', (req, res) => {
  const { uid } = req.query;
  console.log("Fetching alert settings with UID:", uid); // UID가 서버로 전달되었는지 확인

  if (!uid) {
    return res.status(400).json({ success: false, message: "UID가 제공되지 않았습니다." });
  }

  const filePath = path.join(__dirname, '../data/alert_settings.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error loading alert settings:', err);
      return res.status(500).json({ success: false, message: '설정 불러오기 실패' });
    }

    const settings = JSON.parse(data);
    res.json(settings);
  });
});


// 최근 2주간 검사 결과 가져오기
app.get('/get-recent-test-results', (req, res) => {
  const { uid } = req.query;
  const currentDate = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(currentDate.getDate() - 13); // 최근 2주

  const query = `
    SELECT 날짜, PHQ_9점수, GAD_7점수, 통합적_한국판_우울증_척도_점수, 한국형_스트레스_자가척도_점수
    FROM 상태정보
    WHERE UID = ? AND 날짜 BETWEEN ? AND ?
  `;

  db.query(query, [uid, twoWeeksAgo.toISOString().split('T')[0], currentDate.toISOString().split('T')[0]], (err, results) => {
    if (err) {
      console.error('Error fetching recent test results:', err);
      return res.status(500).json({ success: false, message: '검사 결과 불러오기 실패' });
    }
    res.json(results);
  });
});



/////////////////////////////////////////// 커뮤니티 ///////////////////////////////////

// 게시글 저장
app.post('/save-post', (req, res) => {
  const { title, content } = req.body;
  const postId = `P${Math.random().toString(36).substr(2, 9)}`;
  const post = { postId, title, content, createdAt: new Date() };

  const filePath = path.join(__dirname, '../data/posts.json');

  // 기존 게시글 목록 불러오기
  fs.readFile(filePath, 'utf-8', (err, data) => {
      let posts = [];
      if (!err && data) {
          posts = JSON.parse(data);
      }

      // 새로운 게시글 추가
      posts.push(post);

      // 게시글 목록 저장
      fs.writeFile(filePath, JSON.stringify(posts, null, 2), (err) => {
          if (err) {
              console.error('Error saving post:', err);
              return res.status(500).json({ success: false, message: '게시글 저장 실패' });
          }
          res.json({ success: true, message: '게시글이 저장되었습니다.' });
      });
  });
});

// 게시글 불러오기
app.get('/get-posts', (req, res) => {
  const filePath = path.join(__dirname, '../data/posts.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
          console.error('Error loading posts:', err);
          return res.status(500).json({ success: false, message: '게시글 불러오기 실패' });
      }

      const posts = JSON.parse(data);
      res.json(posts);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});