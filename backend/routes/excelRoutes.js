const express = require("express");
const router = express.Router();
const multer = require("multer");
const excelController = require("../controllers/excelController");

// Cấu hình lưu file tạm trong bộ nhớ (Memory Storage) cho nhẹ máy
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route import sản phẩm - Chú ý cái tên 'excelFile' phải khớp với Frontend
router.post("/import-products", upload.single("excelFile"), excelController.importProducts);

// Route import khách hàng (nếu ông cần)
router.post("/import-customers", upload.single("excelFile"), excelController.importCustomers);

module.exports = router;