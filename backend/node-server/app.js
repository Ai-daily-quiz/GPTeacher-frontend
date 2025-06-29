const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 정의
app.get("/", (req, res) => {
  res.json({
    message: "Node.js server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Python 서버로 텍스트 분류 요청
app.post("/api/classify", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Python 서버로 전달
    const response = await axios.post("http://localhost:5001/classify", {
      text: text,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Python server error:", error.message);
    res.status(500).json({
      error: "Failed to connect to Python server",
      details: error.message,
    });
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const body = req.body;
    console.log("🟢 브라우저 => Node : req.body");
    console.log(body);

    // 파이썬 서버로 보내기
    const response = await axios.post("http://localhost:5001/api/relay", {
      message: "암호 메세지",
      relayedAt: new Date().toISOString(),
      originalBody: body,
    });
  } catch (error) {
    console.error(error);
  }
});

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// app 내보내기
module.exports = app;
