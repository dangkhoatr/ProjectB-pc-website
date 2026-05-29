const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db");

const productsRouter = require("./routes/productsRoutes");
const authRouter = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE (PHẢI NẰM TRÊN CÙNG)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ROUTING
app.use("/api/products", productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/excel', excelRoutes);
app.use('/api/orders', orderRoutes); // Đã chuyển xuống dưới json()
app.use("/api/customers", customerRoutes);

// XỬ LÝ ẢNH TĨNH
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/image", express.static(path.join(__dirname, "../frontend/assets/images")));

app.get("/", (req, res) => {
  res.json({ message: "EIU Computer Backend is running" });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server đang chạy ngon lành tại cổng ${PORT}`);
  try {
    const connection = await pool.getConnection();
    console.log("✅ Kết nối MySQL thành công!");
    connection.release();
  } catch (err) {
    console.error("❌ Kết nối MySQL thất bại:", err.message);
  }
});