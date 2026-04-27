const db = require('../db');

const userRepo = {
    // Tìm user bằng Email
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Tìm user bằng Token xác thực
    findByToken: async (token) => {
        const [rows] = await db.query('SELECT id, is_verified, token_expiry FROM users WHERE verify_token = ?', [token]);
        return rows[0];
    },

    // Lấy thông tin hồ sơ Customer
    getCustomerInfo: async (userId) => {
        const [rows] = await db.query('SELECT full_name, phone, address FROM customers WHERE user_id = ?', [userId]);
        return rows[0];
    },

    // Tạo User & Customer mới (Dùng Transaction để đảm bảo an toàn)
    createUser: async (email, passwordHash, verifyToken, expiryTime, fullName, phone, address) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const [userResult] = await connection.query(
                'INSERT INTO users (email, password_hash, role, verify_token, token_expiry) VALUES (?, ?, ?, ?, ?)',
                [email, passwordHash, 'customer', verifyToken, expiryTime]
            );
            
            const userId = userResult.insertId;
            
            await connection.query(
                'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
                [userId, fullName, phone || null, address || null]
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

    // Cập nhật hồ sơ cá nhân
    updateCustomerProfile: async (userId, fullName, phone, address) => {
        await db.query(
            'UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE user_id = ?',
            [fullName, phone, address, userId]
        );
    }
};

module.exports = userRepo;