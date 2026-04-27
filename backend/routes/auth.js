const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

const JWT_SECRET = 'eiu_computer_secret_key_2026'; 

// MIDDLEWARE BẢO VỆ: Kiểm tra Token xem có hợp lệ không
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) return res.status(401).json({ message: 'Con vợ chưa đăng nhập!' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!' });
            }
            return res.status(403).json({ message: 'Thẻ bài không hợp lệ!' });
        }
        
        // Kiểm tra quyền hạn nếu update-profile
        if (req.path === '/update-profile' && decoded.role !== 'customer') {
            return res.status(403).json({ message: 'Chỉ khách hàng mới được sửa hồ sơ này!' });
        }

        req.user = decoded; // Nhét thông tin user vào req để Controller xài
        next(); // Cho đi tiếp
    });
}

// ==========================================
// BẢNG PHÂN LUỒNG CÁC ĐƯỜNG DẪN API
// ==========================================
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/resend-email', authController.resendEmail);

// Đường dẫn này cần qua chốt bảo vệ (verifyToken) trước khi vào Controller
router.put('/update-profile', verifyToken, authController.updateProfile);

module.exports = router;