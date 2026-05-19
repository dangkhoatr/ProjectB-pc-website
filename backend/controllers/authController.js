const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 
const userRepo = require('../repositories/userRepo');
require('dotenv').config();

const JWT_SECRET = 'eiu_computer_secret_key_2026'; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hàm hỗ trợ gửi mail
async function sendVerificationMail(email, fullName, token, isResend = false) {
    const verifyLink = `http://127.0.0.1:5500/frontend/pages/verify-email.html?token=${token}`;
    const subject = isResend ? '[Mã mới] Xác thực tài khoản EIU COMPUTER' : 'Xác thực tài khoản EIU COMPUTER (Hạn 1 phút)';
    const title = isResend ? `Mã xác thực mới của ${fullName}!` : `Chào mừng ${fullName}!`;
    const desc = isResend ? 'Bạn vừa yêu cầu gửi lại mã xác nhận. Nhấn vào nút bên dưới để kích hoạt (Mã có hiệu lực 1 phút):' : 'Chỉ còn một bước cuối cùng, hãy nhấn vào nút bên dưới để kích hoạt tài khoản của bạn (Lưu ý: Mã chỉ có hiệu lực trong <b>1 phút</b>):';

    const mailOptions = {
        from: `"EIU COMPUTER" <${process.env.EMAIL_USER}>`,
        to: email, 
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e11d48; border-radius: 10px; overflow: hidden;">
                <div style="background: #e11d48; color: white; padding: 20px; text-align: center;">
                    <h1>${title}</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6; color: #333;">
                    <p>${desc}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyLink}" style="background: #e11d48; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">XÁC THỰC EMAIL NGAY</a>
                    </div>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
}

const authController = {
    // 1. ĐĂNG KÝ
    register: async (req, res) => {
        const { full_name, email, password, phone, address } = req.body;
        if (!full_name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin bắt buộc!' });

        try {
            const existing = await userRepo.findByEmail(email);
            if (existing) return res.status(400).json({ message: 'Email này có người dùng rồi con vợ ạ!' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const verifyToken = crypto.randomBytes(32).toString('hex');
            const expiryTime = new Date(Date.now() + 60 * 1000); // 1 phút

            await userRepo.createUser(email, hashedPassword, verifyToken, expiryTime, full_name, phone, address);
            await sendVerificationMail(email, full_name, verifyToken, false);

            res.status(201).json({ message: 'Đăng ký thành công! Con vợ check mail để xác thực nhá.' });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ message: 'Lỗi hệ thống, đăng ký thất bại!' });
        }
    },

    // 2. XÁC THỰC EMAIL
    verifyEmail: async (req, res) => {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Không tìm thấy mã xác thực!' });

        try {
            const user = await userRepo.findByToken(token);
            if (!user) return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã bị đổi!' });

            if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
                return res.status(400).json({ message: 'Mã xác thực đã hết hạn! Vui lòng bấm Gửi lại mã.' });
            }

            await userRepo.verifyUserAccount(user.id);
            res.json({ message: 'Xác thực email thành công!' });
        } catch (error) {
            console.error('Lỗi Xác thực:', error);
            res.status(500).json({ message: 'Lỗi hệ thống!' });
        }
    },

    // 3. ĐĂNG NHẬP
    login: async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập Email và Mật khẩu!' });

        try {
            const user = await userRepo.findByEmail(email);
            if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });

            if (Number(user.is_verified) === 0) {
                return res.status(403).json({ message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra Email!' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });

            let fullName = "", phone = "", address = "";
            if (user === 'customer') {
                const customerData = await userRepo.getCustomerInfo(user.id);
                if (customerData) {
                    fullName = customerData.full_name;
                    phone = customerData.phone || "";
                    address = customerData.address || "";
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
                user: { id: user.id, name: fullName, email: user.email, role: user.role, phone, address } 
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ message: 'Lỗi hệ thống!' });
        }
    },

    // 4. GỬI LẠI EMAIL
    resendEmail: async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Không tìm thấy Email để gửi lại!' });

        try {
            const user = await userRepo.findByEmail(email);
            if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });
            if (Number(user.is_verified) === 1) return res.status(400).json({ message: 'Tài khoản này đã được xác thực rồi!' });

            const now = new Date();
            if (user.token_expiry && new Date(user.token_expiry) > now) {
                const timeLeft = Math.ceil((new Date(user.token_expiry) - now) / 1000);
                return res.status(429).json({ message: `Gửi chậm thôi con vợ! Vui lòng chờ ${timeLeft} giây nữa.` });
            }

            const newVerifyToken = crypto.randomBytes(32).toString('hex');
            const newExpiryTime = new Date(Date.now() + 60 * 1000); 

            await userRepo.updateVerifyToken(user.id, newVerifyToken, newExpiryTime);

            let fullName = "Khách hàng";
            const customerData = await userRepo.getCustomerInfo(user.id);
            if (customerData) fullName = customerData.full_name;

            await sendVerificationMail(email, fullName, newVerifyToken, true);
            
            res.json({ message: 'Đã gửi lại Email xác thực mới! Con vợ check lại nhé.' });
        } catch (error) {
            console.error('Lỗi Resend:', error);
            res.status(500).json({ message: 'Lỗi hệ thống, không gửi lại được!' });
        }
    },

    // 5. CẬP NHẬT HỒ SƠ
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ middleware bảo vệ
            const { full_name, phone, address } = req.body;

            await userRepo.updateCustomerProfile(userId, full_name, phone, address);
            res.json({ message: 'Cập nhật hồ sơ nét căng!' });
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
        }
    }
};

module.exports = authController;