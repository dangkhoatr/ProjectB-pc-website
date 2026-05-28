const db = require('../db');

const orderRepo = {
    // GHI NHẬN ĐƠN HÀNG VÀ TRỪ KHO (Đã vá lỗ hổng Hack Giá)
    createOrderRecord: async (customerUuid, cartItems) => { 
        // Lưu ý: Đã bỏ tham số totalAmount từ Frontend
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const orderCode = 'ORD-' + Date.now().toString().slice(-6);

            // 1. Tạo Hóa đơn tổng (Tạm thời để giá 0 đồng)
            const [orderResult] = await connection.query(
                'INSERT INTO orders (customer_id, order_code, total_amount, status) VALUES (?, ?, ?, ?)',
                [customerUuid, orderCode, 0, 'Đang xử lý']
            );
            
            const orderId = orderResult.insertId;
            let realTotalAmount = 0;

            // 2. Quét giỏ hàng: Lấy giá thật -> Trừ kho -> Ghi chi tiết
            for (let item of cartItems) {
                // 🔥 LẤY GIÁ THẬT TỪ DATABASE (Tuyệt đối không dùng item.price của Frontend)
                const [productDb] = await connection.query('SELECT price FROM products WHERE id = ?', [item.id]);
                
                if (productDb.length === 0) {
                    throw new Error(`Sản phẩm "${item.name}" không tồn tại trong hệ thống!`);
                }
                
                const realPrice = productDb[0].price;
                realTotalAmount += (realPrice * item.qty);

                // Trừ kho an toàn
                const [updateResult] = await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [item.qty, item.id, item.qty]
                );

                if (updateResult.affectedRows === 0) {
                    throw new Error(`Sản phẩm "${item.name}" đã hết hoặc không đủ số lượng trong kho!`);
                }

                // Ghi vào order_items VỚI GIÁ THẬT
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, product_name, category_name, quantity, price, product_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [orderId, item.id, item.name, item.category || 'Linh kiện', item.qty, realPrice, item.image || '']
                );
            }

            // 3. Cập nhật lại tổng tiền chính xác cho Hóa đơn
            await connection.query(
                'UPDATE orders SET total_amount = ? WHERE id = ?',
                [realTotalAmount, orderId]
            );

            await connection.commit();
            return orderCode;
        } catch (error) {
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