const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../front")));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "your_username",
  password: "your_password",
  database: "HowWasYourDay"
});

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
        AID CHAR(5) PRIMARY KEY,
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

app.post("/save-diary", (req, res) => {
  const { date, content } = req.body;
  const filePath = path.join(__dirname, "../diaries", `${date}.txt`);

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error saving diary:", err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

app.get("/load-diaries", (req, res) => {
  const diariesDir = path.join(__dirname, "../diaries");
  const diaries = {};

  fs.readdir(diariesDir, (err, files) => {
    if (err) {
      console.error("Error loading diaries:", err);
      return res.json(diaries);
    }

    files.forEach((file) => {
      const date = path.basename(file, ".txt");
      const content = fs.readFileSync(path.join(diariesDir, file), "utf-8");
      diaries[date] = content;
    });

    res.json(diaries);
  });
});

app.get("/get-activities", (req, res) => {
  const { year, month, uid } = req.query;
  const activitiesDir = path.join(__dirname, "../activities");
  const activities = [];

  fs.readdir(activitiesDir, (err, files) => {
    if (err) {
      console.error("Error loading activities:", err);
      return res.json(activities);
    }

    files.forEach((file) => {
      if (file.includes(`${uid}_${year}-${month}`)) {
        const content = fs.readFileSync(
          path.join(activitiesDir, file),
          "utf-8"
        );
        activities.push(JSON.parse(content));
      }
    });

    res.json(activities);
  });
});

app.post("/save-activity", (req, res) => {
  const { uid, date, activities } = req.body;
  const activitiesDir = path.join(__dirname, "../activities");

  if (!fs.existsSync(activitiesDir)) {
    fs.mkdirSync(activitiesDir);
  }

  activities.forEach((activity, index) => {
    const activityFile = path.join(
      activitiesDir,
      `${uid}_${date}_${index}.json`
    );
    fs.writeFileSync(activityFile, JSON.stringify(activity), (err) => {
      if (err) {
        console.error("Error saving activity:", err);
        return res.json({ success: false });
      }
    });
  });

  res.json({ success: true });
});

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

app.post("/save-test-result", (req, res) => {
  const { uid, date, testType, score } = req.body;

  const checkQuery = `
    SELECT COUNT(*) AS count
    FROM 상태정보
    WHERE UID = ? AND 날짜 = ? AND ${testType} != -1
  `;
  db.query(checkQuery, [uid, date], (err, results) => {
    if (err) throw err;
    if (results[0].count > 0) {
      return res.json({ success: false, message: "이미 수행한 검사입니다." });
    }

    db.query("SELECT MAX(CAST(SUBSTRING(SID, 2) AS UNSIGNED)) AS maxId FROM 상태정보", (err, results) => {
      if (err) throw err;
      const nextId = results[0].maxId ? results[0].maxId + 1 : 1;
      const sid = `S${String(nextId).padStart(4, "0")}`;

      const insertQuery = `
        INSERT INTO 상태정보 (SID, UID, 날짜, PHQ_9점수, GAD_7점수, 통합적_한국판_우울증_척도_점수, 한국형_스트레스_자가척도_점수)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [sid, uid, date, -1, -1, -1, -1];
      if (testType === "PHQ_9점수") values[3] = score;
      else if (testType === "GAD_7점수") values[4] = score;
      else if (testType === "통합적_한국판_우울증_척도_점수") values[5] = score;
      else if (testType === "한국형_스트레스_자가척도_점수") values[6] = score;

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error saving test result:", err);
          return res.json({ success: false });
        }
        res.json({ success: true });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
