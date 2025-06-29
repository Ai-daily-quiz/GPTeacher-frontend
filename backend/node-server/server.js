const app = require("./app");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Node.js server is running!`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔗 Python server expected at http://localhost:5001`);
});
