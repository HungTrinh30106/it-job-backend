import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from "./configs/database.config";

const app = express();
const port = 4000;

// Kết nối Database
connectDB();

// Cấu hình CORS
app.use(
  cors({
    origin: "*", // Thay đổi thành địa chỉ của frontend
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json()); // Middleware để chuyển đổi dữ liệu JSON từ request body thành đối tượng JavaScript

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
