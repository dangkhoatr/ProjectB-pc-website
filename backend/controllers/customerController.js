const db = require('../db');

const customerController = {
    searchCustomer: async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });

            // 1. CÂU LỆNH CHÍ MẠNG: Dùng LEFT JOIN móc email từ bảng users (u.email)
            const [customers] = await db.query(
                `SELECT c.*, u.email 
                 FROM customers c 
                 LEFT JOIN users u ON c.user_id = u.id 
                 WHERE c.phone = ? OR c.customer_code = ? OR c.customer_id = ? 
                 LIMIT 1`,
                [q, q, q]
            );

            if (customers.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy khách hàng này trong hệ thống!" });
            }

            const cust = customers[0];
            
            // 2. TÌM LỊCH SỬ MUA HÀNG
            let history = [];
            try {
                const [orders] = await db.query(
                    `SELECT id, order_code, order_date, total_amount, status 
                     FROM orders 
                     WHERE customer_id = ? 
                     ORDER BY order_date DESC`,
                    [cust.customer_id]
                );
                
                history = orders.map(o => ({
                    id: o.order_code || `ORD-${o.id}`,
                    date: new Date(o.order_date).toLocaleString('vi-VN'),
                    type: "Đơn hàng hệ thống",
                    total: Number(o.total_amount) || 0,
                    status: o.status
                }));
            } catch (e) {
                // Bỏ qua nếu bảng orders chưa có
            }

            // 3. TRẢ DỮ LIỆU VỀ CÓ KÈM EMAIL
            res.json({
                uuid: cust.customer_id,           
                customer_code: cust.customer_code,
                name: cust.full_name,             
                phone: cust.phone || "Chưa cập nhật",
                email: cust.email, // <--- TRẢ CHUẨN EMAIL VỀ ĐÂY
                loyalty_points: cust.loyalty_points,
                history: history
            });

        } catch (error) {
            console.error("🔥 Lỗi searchCustomer:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tra cứu khách hàng!" });
        }
    }
};

module.exports = customerController;