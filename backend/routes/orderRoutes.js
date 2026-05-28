const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
// Nhớ import cái file Middleware kiểm tra Token của team ông vào (tùy cấu trúc thư mục)
const authMiddleware = require('../middleware/authMiddleware'); 

// Route thanh toán (Checkout) - BẮT BUỘC phải kẹp authMiddleware để Backend lấy được req.user.id
router.post('/checkout', authMiddleware, orderController.checkout);

router.get('/history', authMiddleware, orderController.getHistory);

module.exports = router;