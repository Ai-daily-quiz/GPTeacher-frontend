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
    console.log("🔴 Python server error ");
    console.error("Python server error:", error.message);
    res.status(500).json({
      error: "Failed to connect to Python server",
      details: error.message,
    });
  }
});

// Python 서버로 텍스트 분류 요청
app.post("/api/message", async (req, res) => {
  try {
    const { clipboard } = req.body;
    console.log("🟢 클립보드 텍스트 길이:", clipboard?.length);

    const response = await axios.post("http://localhost:5001/api/analyze", {
      text: clipboard,
    });

    console.log("🟢 Python 서버 응답:", response.data);
    console.log("🟢 클라이언트로 전송");

    // 응답을 클라이언트에게 전송
    res.json(response.data);
  } catch (error) {
    console.error("Python 서버 에러:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to analyze text",
      details: error.response?.data || error.message,
    });
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
