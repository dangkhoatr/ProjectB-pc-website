const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db");

// 1. NHÚNG CÁC ROUTER XỊN VÀO ĐÂY (Đã xóa sổ partsRouter)
const productsRouter = require("./routes/productsRoutes");
const authRouter = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes'); // Kéo Excel lên đây cho chuẩn bài
const app = express();
const PORT = process.env.PORT || 3000;
const orderRoutes = require('./routes/orderRoutes');
// 2. MIDDLEWARE CƠ BẢN
app.use('/api/orders', orderRoutes);
app.use(cors());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//lấy dữ liệu khách hàng
const customerRoutes = require('./routes/customerRoutes');
app.use("/api/customers", customerRoutes);
// 3. XỬ LÝ ẢNH TĨNH
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/image", express.static(path.join(__dirname, "../frontend/assets/images")));

// 4. API TEST CƠ BẢN
app.get("/", (req, res) => {
  res.json({ message: "EIU Computer Backend is running" });
});

// 5. GẮN ĐƯỜNG DẪN API (Đã xóa sổ /api/parts)
app.use("/api/products", productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/excel', excelRoutes);

// 6. KHỞI ĐỘNG SERVER
app.listen(PORT, async () => {
  console.log(`🚀 Server đang chạy ngon lành tại cổng ${PORT}`);

  // Kiểm tra kết nối MySQL
  try {
    const connection = await pool.getConnection();
    console.log("✅ Kết nối MySQL thành công!");
    connection.release();
  } catch (err) {
    console.error("❌ Kết nối MySQL thất bại:", err.message);
  }
});