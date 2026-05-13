const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route tìm kiếm khách hàng
router.get('/search', customerController.searchCustomer);

module.exports = router;