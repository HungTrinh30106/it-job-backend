import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from "./configs/database.config";
import cookieParser from "cookie-parser";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// Kết nối Database
connectDB();

// Cấu hình CORS
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Sử dụng cookie-parser
app.use(cookieParser());

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
