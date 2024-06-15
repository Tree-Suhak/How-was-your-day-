const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../front')));

app.get('/', (req, res) => {
    const date = new Date();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 1을 더합니다.

    let monthFile = '';
    switch (month) {
        case 1:
            monthFile = 'january.html';
            break;
        case 2:
            monthFile = 'february.html';
            break;
        case 3:
            monthFile = 'march.html';
            break;
        case 4:
            monthFile = 'april.html';
            break;
        case 5:
            monthFile = 'may.html';
            break;
        case 6:
            monthFile = 'june.html';
            break;
        // 필요에 따라 추가
        default:
            monthFile = 'april.html'; // 기본값
    }

    res.sendFile(path.join(__dirname, `../front/calendar/${monthFile}`));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
