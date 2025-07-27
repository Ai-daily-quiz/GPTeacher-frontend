const isDev = process.env.NODE_ENV !== "production";

const PYTHON_API_URL = isDev
  ? "http://localhost:5001"
  : "http://quiz-app-python-env.eba-jeuj3kxz.ap-northeast-2.elasticbeanstalk.com";

module.exports = { PYTHON_API_URL };
