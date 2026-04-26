const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db'); // File cấu hình MySQL của ông (Singleton)

// --- CẤU HÌNH GỬI EMAIL (Nodemailer) ---
// Tạm thời dùng Gmail, mốt ông thay bằng email thực tế
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'giakiet189@gmail.com', // Đổi thành email của ông
        pass: 'ulnt jqlq uinp zwym'  // Xem hướng dẫn tạo mật khẩu ứng dụng bên dưới
    }
});

const AuthController = {
    // API 1: XỬ LÝ ĐĂNG KÝ (REGISTER)
    register: async (req, res) => {
        // 1. Lấy dữ liệu từ Frontend gửi lên
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ message: "Vui lòng nhập đủ thông tin bắt buộc!" });
        }

        // Mở kết nối riêng để dùng Transaction
        const connection = await db.getConnection(); 

        try {
            await connection.beginTransaction(); // Bắt đầu Giao dịch an toàn

            // 2. Kiểm tra xem Email đã tồn tại chưa
            const [existingUsers] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
            if (existingUsers.length > 0) {
                await connection.rollback(); // Hoàn tác nếu lỗi
                return res.status(400).json({ message: "Email này đã được sử dụng!" });
            }

            // 3. Băm mật khẩu (Độ khó: 10 vòng)
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 4. Tạo chuỗi Token ngẫu nhiên để gửi vào Email
            const verifyToken = crypto.randomBytes(32).toString('hex');

            // 5. INSERT VÀO BẢNG USERS (Lưu tk đăng nhập)
            const [userResult] = await connection.query(
                "INSERT INTO users (email, password_hash, verify_token, role) VALUES (?, ?, ?, 'customer')",
                [email, passwordHash, verifyToken]
            );
            
            const newUserId = userResult.insertId; // Lấy ID vừa tạo

            // 6. INSERT VÀO BẢNG CUSTOMERS (Lưu hồ sơ)
            await connection.query(
                "INSERT INTO customers (user_id, full_name, phone) VALUES (?, ?, ?)",
                [newUserId, full_name, phone || null]
            );

            // 7. CHỐT GIAO DỊCH (Lưu vĩnh viễn vào DB)
            await connection.commit();

            // 8. Gửi Email Xác thực
            const verificationLink = `http://localhost:3000/api/auth/verify?token=${verifyToken}&email=${email}`;
            
            const mailOptions = {
                from: '"EIU Computer" <no-reply@eiucomputer.com>',
                to: email,
                subject: 'Xác thực tài khoản EIU Computer',
                html: `
                    <h2>Chào mừng ${full_name} đến với EIU Computer!</h2>
                    <p>Vui lòng click vào nút bên dưới để xác thực tài khoản của bạn:</p>
                    <a href="${verificationLink}" style="background:#dc2626; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">
                        Xác Thực Tài Khoản
                    </a>
                    <p>Hoặc copy đường dẫn này: ${verificationLink}</p>
                `
            };

            // Gửi mail chạy ngầm, không làm Frontend phải đợi lâu
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.log("Lỗi gửi mail: ", error);
                else console.log("Đã gửi mail xác nhận đến: " + email);
            });

            // 9. Báo tin vui về cho Frontend
            res.status(201).json({ 
                message: "Đăng ký thành công! Vui lòng kiểm tra Email để xác thực tài khoản." 
            });

        } catch (error) {
            // NẾU CÓ BẤT KỲ LỖI GÌ (Code sai, DB sập...), HOÀN TÁC TOÀN BỘ!
            await connection.rollback();
            console.error("Lỗi đăng ký:", error);
            res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
        } finally {
            connection.release(); // Trả kết nối lại cho hệ thống
        }
    }
};

module.exports = AuthController;