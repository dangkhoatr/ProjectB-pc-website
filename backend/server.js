const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db");
const productsRouter = require("./routes/products");
const partsRouter = require("./routes/parts");
const authRouter = require('./routes/auth'); // Di chuyển lên trên cho gọn

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SỬA TẠI ĐÂY: Thêm __ trước dirname
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/image", express.static(path.join(__dirname, "../frontend/assets/images")));

app.get("/", (req, res) => {
  res.json({ message: "EIU Computer Backend is running" });
});

app.use("/api/products", productsRouter);
app.use("/api/parts", partsRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, async () => {
  // SỬA TẠI ĐÂY: Dùng dấu backtick ` thay vì dấu ' hoặc "
  console.log("Server chạy tại");

  // Kiểm tra kết nối MySQL
  try {
    const connection = await pool.getConnection();
    console.log("✅ Kết nối MySQL thành công!");
    connection.release();
  } catch (err) {
    console.error("❌ Kết nối MySQL thất bại:", err.message);
    // Nếu bạn gặp lỗi "Access denied" hay "Password expired" ở đây, 
    // hãy dùng lệnh ALTER USER như mình đã hướng dẫn ở trên nhé!
  }
});