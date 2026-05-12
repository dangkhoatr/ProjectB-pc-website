const db = require('../db');

const orderRepo = {
    // GHI NHẬN ĐƠN HÀNG VÀ TRỪ KHO (Cực kỳ an toàn)
    createOrderRecord: async (customerUuid, totalAmount, cartItems) => {
        const connection = await db.getConnection();
        try {
            // Bắt đầu Transaction: Nếu 1 bước lỗi, toàn bộ sẽ bị hủy (Rollback)
            await connection.beginTransaction();

            const orderCode = 'ORD-' + Date.now().toString().slice(-6);

            // 1. Tạo Hóa đơn tổng
            const [orderResult] = await connection.query(
                'INSERT INTO orders (customer_id, order_code, total_amount, status) VALUES (?, ?, ?, ?)',
                [customerUuid, orderCode, totalAmount, 'Đang xử lý']
            );
            
            const orderId = orderResult.insertId;

            // 2. Quét giỏ hàng: Ghi chi tiết VÀ Trừ kho
            for (let item of cartItems) {
                // 🔥 CHIÊU THỨC TRỪ KHO AN TOÀN: Chỉ trừ khi stock >= số lượng mua
                const [updateResult] = await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [item.qty, item.id, item.qty]
                );

                // Nếu affectedRows = 0 nghĩa là kho không đủ hàng -> Báo lỗi ngay lập tức
                if (updateResult.affectedRows === 0) {
                    throw new Error(`Sản phẩm "${item.name}" đã hết hoặc không đủ số lượng trong kho!`);
                }

                // Nếu trừ kho thành công, mới ghi vào lịch sử mua hàng
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, product_name, category_name, quantity, price, product_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [orderId, item.id, item.name, item.category || 'Linh kiện', item.qty, item.price, item.image || '']
                );
            }

            // Hoàn tất không có lỗi -> Lưu vĩnh viễn vào DB
            await connection.commit();
            return orderCode;
        } catch (error) {
            // Bất kỳ lỗi nào xảy ra (kể cả vụ hết hàng ở trên), hoàn tác (nhả lại kho) ngay lập tức
            await connection.rollback();
            throw error; 
        } finally {
            connection.release();
        }
    },

    getOrdersByCustomerUuid: async (customerUuid) => {
        const [orders] = await db.query(
            'SELECT id, order_code, order_date, status, total_amount FROM orders WHERE customer_id = ? ORDER BY order_date DESC',
            [customerUuid]
        );

        for (let order of orders) {
            const [items] = await db.query(
                'SELECT product_id, product_name, category_name, quantity, price, product_image FROM order_items WHERE order_id = ?',
                [order.id]
            );
            order.items = items;
        }
        
        return orders;
    }
};

module.exports = orderRepo;