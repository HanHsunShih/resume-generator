import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import knex from "knex";
import axios from "axios";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 設置 Knex 連接資料庫
const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
});

// 測試 API
app.get("/", (req, res) => {
  res.send("TypeScript Server with Knex is running!");
});

// 測試資料庫連線
app.get("/users", async (req, res) => {
  try {
    const users = await db.select("*").from("users"); // 假設有 users 資料表
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
});

// Axios 測試 API（GET 請求到另一個 API）
app.get("/external-data", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching external data", error });
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
