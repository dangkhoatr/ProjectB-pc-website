const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ĐÃ BẬT LẠI MIDDLEWARE ĐỂ KIỂM TRA ĐĂNG NHẬP
const authMiddleware = require('../middleware/authMiddleware'); 

// Khai báo 5 API cho luồng hóa đơn
router.post('/checkout', authMiddleware, orderController.checkout);
router.get('/history', authMiddleware, orderController.getHistory);
router.post('/pay', authMiddleware, orderController.payOrder);
router.get('/detail/:code', authMiddleware, orderController.getOrderDetail);
router.post('/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;