const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // 1. Tìm Token trong thẻ Header mà Frontend gửi lên
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Từ chối truy cập! Không tìm thấy Token xác thực.' });
        }

        // 2. Cắt lấy chuỗi Token (Bỏ chữ 'Bearer ' đi)
        const token = authHeader.split(' ')[1];

        // 3. Giải mã Token 
        // LƯU Ý: Chữ 'secret_key_cua_ban' phải giống hệt chữ mà ông dùng ở file authController lúc đăng nhập nhé!
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eiu_computer_secret_key_2026');
        
        // 4. Bỏ thông tin giải mã được vào req.user (để thằng orderController lấy req.user.id)
        req.user = decoded;
        
        // 5. Cấp phép cho đi tiếp vào Controller
        next(); 
        
    } catch (error) {
        console.error('Lỗi xác thực Token:', error.message);
        return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!' });
    }
};

module.exports = authMiddleware;