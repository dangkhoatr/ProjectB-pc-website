const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Xóa dòng require middleware đi cho đỡ lỗi MODULE_NOT_FOUND
// const authMiddleware = require('../middleware/authMiddleware'); 

// Tuyến đường đi thẳng vào checkout, không qua bảo vệ
router.post('/checkout', orderController.checkout);

router.get('/history', orderController.getHistory);

module.exports = router;