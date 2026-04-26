const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productsRouter = require("./routes/products");
const partsRouter = require("./routes/parts");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/image", express.static(path.join(__dirname, "../frontend/assets/images")));
app.get("/", (req, res) => {
  res.json({ message: "EIU Computer Backend is running" });
});

app.use("/api/products", productsRouter);
app.use("/api/parts", partsRouter);

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
// Khai báo Router mới
const authRouter = require('./routes/auth');

// Mở đường dẫn API
app.use('/api/auth', authRouter);
