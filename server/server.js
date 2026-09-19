require("dotenv").config();
const app = require("./app");
const connectDB = require("./db/db");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  } catch (err) {
    console.log("Could not start server:", err.message);
  }
};

start();
