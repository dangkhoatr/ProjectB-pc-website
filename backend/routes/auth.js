require('dotenv').config(); // Lấy biến môi trường .env
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 
const db = require('../db');

const JWT_SECRET = 'eiu_computer_secret_key_2026'; 

// Cấu hình "xe vận chuyển" email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 1. API ĐĂNG KÝ (GỬI MAIL THẬT + SET HẠN TOKEN 1 PHÚT)
// ==========================================
router.post('/register', async (req, res) => {
    const { full_name, email, password, phone, address } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đủ thông tin bắt buộc!' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Email này có người dùng rồi con vợ ạ!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        
        // CÀI ĐẶT THỜI GIAN HẾT HẠN (Hiện tại + 1 phút)
        const expiryTime = new Date(Date.now() + 60 * 1000);

        const [userResult] = await connection.query(
            'INSERT INTO users (email, password_hash, role, verify_token, token_expiry) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, 'customer', verifyToken, expiryTime] // Thêm expiryTime
        );
        const userId = userResult.insertId;

        await connection.query(
            'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
            [userId, full_name, phone || null, address || null]
        );

        // GỬI MAIL THẬT
        const verifyLink = `http://127.0.0.1:5500/frontend/pages/verify-email.html?token=${verifyToken}`;
        
        const mailOptions = {
            from: `"EIU COMPUTER" <${process.env.EMAIL_USER}>`,
            to: email, 
            subject: 'Xác thực tài khoản EIU COMPUTER (Hạn 1 phút)',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e11d48; border-radius: 10px; overflow: hidden;">
                    <div style="background: #e11d48; color: white; padding: 20px; text-align: center;">
                        <h1>Chào mừng ${full_name}!</h1>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        <p>Cảm ơn bạn đã đăng ký tại <b>EIU COMPUTER</b>.</p>
                        <p>Chỉ còn một bước cuối cùng, hãy nhấn vào nút bên dưới để kích hoạt tài khoản của bạn (Lưu ý: Mã chỉ có hiệu lực trong <b>1 phút</b>):</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyLink}" style="background: #e11d48; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">XÁC THỰC EMAIL NGAY</a>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        await connection.commit(); 
        
        res.status(201).json({ message: 'Đăng ký thành công! Con vợ check mail để xác thực nhá.' });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi hệ thống, đăng ký thất bại!' });
    } finally {
        connection.release();
    }
});

// ==========================================
// 2. API XÁC THỰC EMAIL (CHECK HẠN)
// ==========================================
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: 'Không tìm thấy mã xác thực!' });

    try {
        const [users] = await db.query('SELECT id, token_expiry FROM users WHERE verify_token = ?', [token]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã bị đổi!' });
        }

        const user = users[0];

        // CHECK HẠN KHI KHÁCH BẤM XÁC THỰC
        if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
            return res.status(400).json({ message: 'Mã xác thực đã hết hạn! Vui lòng bấm Gửi lại mã.' });
        }

        await db.query('UPDATE users SET is_verified = TRUE, verify_token = NULL, token_expiry = NULL WHERE id = ?', [user.id]);
        res.json({ message: 'Xác thực email thành công!' });
    } catch (error) {
        console.error('Lỗi Xác thực:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
});

// ==========================================
// 3. API ĐĂNG NHẬP 
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập Email và Mật khẩu!' });

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });

        const user = users[0];

        if (Number(user.is_verified) === 0) {
            return res.status(403).json({ message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra Email!' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });

        let fullName = "Người dùng";
        let phone = "";
        let address = "";
        
        if (user.role === 'customer') {
            const [customers] = await db.query('SELECT full_name, phone, address FROM customers WHERE user_id = ?', [user.id]);
            if (customers.length > 0) {
                fullName = customers[0].full_name;
                phone = customers[0].phone || "";
                address = customers[0].address || "";
            }
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: fullName, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Đăng nhập thành công!', 
            token, 
            user: { 
                id: user.id, 
                name: fullName, 
                email: user.email, 
                role: user.role, 
                phone: phone, 
                address: address 
            } 
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
});

// ==========================================
// 4. API CẬP NHẬT HỒ SƠ CÁ NHÂN
// ==========================================
router.put('/update-profile', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) return res.status(401).json({ message: 'Con vợ chưa đăng nhập!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (decoded.role !== 'customer') {
            return res.status(403).json({ message: 'Chỉ khách hàng mới được sửa hồ sơ này!' });
        }

        const { full_name, phone, address } = req.body;

        await db.query(
            'UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE user_id = ?',
            [full_name, phone, address, userId]
        );

        res.json({ message: 'Cập nhật hồ sơ nét căng!' });

    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!' });
        }
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
});

// ==========================================
// 5. API GỬI LẠI EMAIL XÁC THỰC (RESEND)
// ==========================================
router.post('/resend-email', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Không tìm thấy Email để gửi lại!' });

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check xem tài khoản có thật không
        const [users] = await connection.query('SELECT id, is_verified, token_expiry FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
        }

        const user = users[0];

        if (Number(user.is_verified) === 1) {
            await connection.rollback();
            return res.status(400).json({ message: 'Tài khoản này đã được xác thực rồi!' });
        }

        // 2. CHECK HẠN - Nếu chưa hết 1 phút thì chặn
        const now = new Date();
        if (user.token_expiry && new Date(user.token_expiry) > now) {
            const timeLeft = Math.ceil((new Date(user.token_expiry) - now) / 1000);
            await connection.rollback();
            return res.status(429).json({ 
                message: `Gửi chậm thôi con vợ! Vui lòng chờ ${timeLeft} giây nữa.` 
            });
        }

        // 3. Đã quá 1p -> Cấp Token mới và gia hạn thêm 1 phút
        const newVerifyToken = crypto.randomBytes(32).toString('hex');
        const newExpiryTime = new Date(Date.now() + 60 * 1000); 

        await connection.query(
            'UPDATE users SET verify_token = ?, token_expiry = ? WHERE id = ?', 
            [newVerifyToken, newExpiryTime, user.id]
        );

        let fullName = "Khách hàng";
        const [customers] = await connection.query('SELECT full_name FROM customers WHERE user_id = ?', [user.id]);
        if (customers.length > 0) fullName = customers[0].full_name;

        // 4. Gửi Mail mới
        const verifyLink = `http://127.0.0.1:5500/frontend/pages/verify-email.html?token=${newVerifyToken}`;
        
        const mailOptions = {
            from: `"EIU COMPUTER" <${process.env.EMAIL_USER}>`,
            to: email, 
            subject: '[Mã mới] Xác thực tài khoản EIU COMPUTER',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e11d48; border-radius: 10px; overflow: hidden;">
                    <div style="background: #e11d48; color: white; padding: 20px; text-align: center;">
                        <h1>Mã xác thực mới của ${fullName}!</h1>
                    </div>
                    <div style="padding: 30px; line-height: 1.6; color: #333;">
                        <p>Bạn vừa yêu cầu gửi lại mã xác nhận. Nhấn vào nút bên dưới để kích hoạt (Mã có hiệu lực 1 phút):</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyLink}" style="background: #e11d48; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">XÁC THỰC EMAIL NGAY</a>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        await connection.commit(); 
        
        res.json({ message: 'Đã gửi lại Email xác thực mới! Con vợ check lại nhé.' });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi Resend:', error);
        res.status(500).json({ message: 'Lỗi hệ thống, không gửi lại được!' });
    } finally {
        connection.release();
    }
});

module.exports = router;