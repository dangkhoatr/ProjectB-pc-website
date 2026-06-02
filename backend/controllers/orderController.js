const orderRepo = require('../repositories/orderRepo');
const userRepo = require('../repositories/userRepo');

const orderController = {
    checkout: async (req, res) => {
        try {
            const userId = req.user.id; 
            const { cartItems, totalAmount } = req.body; 

            if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
                return res.status(400).json({ message: 'Dữ liệu giỏ hàng không hợp lệ hoặc trống!' });
            }

            const customerInfo = await userRepo.getCustomerInfo(userId);
            if (!customerInfo) {
                return res.status(404).json({ message: 'Lỗi định danh! Không tìm thấy hồ sơ khách hàng.' });
            }

            const orderCode = await orderRepo.createOrderRecord(customerInfo.customer_id, cartItems);

            res.status(201).json({ 
                message: 'Thanh toán thành công! Mã đơn: ' + orderCode,
                order_code: orderCode
            });

        } catch (error) {
            console.error('Lỗi tạo Đơn hàng:', error);
            if (error.message && error.message.includes('không đủ số lượng')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Lỗi hệ thống máy chủ, không thể chốt đơn!' });
        }
    },

    getHistory: async (req, res) => {
        try {
            const userId = req.user.id; 

            const customerInfo = await userRepo.getCustomerInfo(userId);
            
            if (!customerInfo) return res.status(404).json({ message: 'Không tìm thấy hồ sơ!' });

            const history = await orderRepo.getOrdersByCustomerUuid(customerInfo.customer_id);

            res.json({ message: 'Lấy dữ liệu thành công', data: history });
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
            res.status(500).json({ message: 'Lỗi hệ thống!' });
        }
    },

    payOrder: async (req, res) => {
        try {
            const { order_code } = req.body;
            if (!order_code) return res.status(400).json({ message: 'Thiếu mã đơn hàng!' });

            const success = await orderRepo.updateOrderStatus(order_code, 'Đã thanh toán');
            if (!success) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });

            res.json({ message: 'Thanh toán thành công!' });
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi thanh toán!' });
        }
    },

    getOrderDetail: async (req, res) => {
        try {
            const customerInfo = await userRepo.getCustomerInfo(req.user.id);
            const order = await orderRepo.getOrderByCode(req.params.code, customerInfo.customer_id);
            if (!order) return res.status(404).json({ message: 'Không tìm thấy hóa đơn này!' });
            res.json(order);
        } catch (error) {
            // 🔥 THÊM DÒNG NÀY VÀO ĐỂ BÁO LỖI RA TERMINAL MÀU ĐỎ:
            console.error('LỖI LẤY CHI TIẾT HÓA ĐƠN:', error);
            res.status(500).json({ message: 'Lỗi hệ thống!' });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const { order_code } = req.body;
            const customerInfo = await userRepo.getCustomerInfo(req.user.id);
            await orderRepo.cancelOrder(order_code, customerInfo.customer_id);
            res.json({ message: 'Hủy đơn hàng thành công!' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = orderController;