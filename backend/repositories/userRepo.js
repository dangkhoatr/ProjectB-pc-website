const db = require('../db');

const userRepo = {
    // Tìm user bằng Email (Dùng lúc đăng ký để chống trùng)
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Tìm user bằng Số điện thoại (Dùng lúc Đăng nhập) - MỚI
    findByPhone: async (phone) => {
        const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
        return rows[0];
    },

    // Tìm user bằng Token xác thực
    findByToken: async (token) => {
        const [rows] = await db.query('SELECT id, is_verified, token_expiry FROM users WHERE verify_token = ?', [token]);
        return rows[0];
    },

    // Lấy thông tin hồ sơ Customer (Đã thêm CCCD, Mã KH)
    getCustomerInfo: async (userId) => {
        const [rows] = await db.query('SELECT customer_id, customer_code, full_name, phone, cccd, address FROM customers WHERE user_id = ?', [userId]);
        return rows[0];
    },

    // Lấy thông tin Admin - MỚI
    getAdminInfo: async (userId) => {
        const [rows] = await db.query('SELECT full_name, employee_code FROM admins WHERE user_id = ?', [userId]);
        return rows[0];
    },

    // Tạo User & Customer mới (Dùng Transaction để đảm bảo an toàn)
    createUser: async (email, phone, passwordHash, verifyToken, expiryTime, fullName, cccd, address, customerCode) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // 1. Thêm vào bảng users (Đã bổ sung phone)
            const [userResult] = await connection.query(
                'INSERT INTO users (email, phone, password_hash, role, verify_token, token_expiry) VALUES (?, ?, ?, ?, ?, ?)',
                [email, phone, passwordHash, 'customer', verifyToken, expiryTime]
            );
            
            const userId = userResult.insertId;
            
            // 2. Thêm vào bảng customers (Bổ sung customer_code, cccd. Còn customer_id UUID thì DB tự sinh)
            await connection.query(
                'INSERT INTO customers (user_id, customer_code, full_name, phone, cccd, address) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, customerCode, fullName, phone, cccd || null, address || null]
            );
            
            await connection.commit();
            return userId;
        } catch (error) {
            await connection.rollback();
            throw error; // Ném lỗi lên cho Controller xử lý
        } finally {
            connection.release();
        }
    },

    // Xác thực tài khoản thành công
    verifyUserAccount: async (userId) => {
        await db.query('UPDATE users SET is_verified = TRUE, verify_token = NULL, token_expiry = NULL WHERE id = ?', [userId]);
    },

    // Cập nhật mã Token mới khi bấm Gửi lại
    updateVerifyToken: async (userId, newToken, newExpiry) => {
        await db.query('UPDATE users SET verify_token = ?, token_expiry = ? WHERE id = ?', [newToken, newExpiry, userId]);
    },

    // Cập nhật hồ sơ cá nhân (Đồng bộ 2 bảng)
    updateCustomerProfile: async (userId, fullName, phone, address, cccd) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Cập nhật bảng customers (thêm CCCD)
            await connection.query(
                'UPDATE customers SET full_name = ?, phone = ?, address = ?, cccd = ? WHERE user_id = ?',
                [fullName, phone, address, cccd, userId]
            );

            // 2. Cập nhật SĐT bên bảng users để khách có thể dùng SĐT mới đăng nhập
            await connection.query(
                'UPDATE users SET phone = ? WHERE id = ?',
                [phone, userId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = userRepo;