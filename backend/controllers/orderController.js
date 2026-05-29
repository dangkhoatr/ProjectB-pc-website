const orderRepo = require('../repositories/orderRepo');
const userRepo = require('../repositories/userRepo');

const orderController = {
    checkout: async (req, res) => {
    try {
        // GÁN CỨNG ID KHÁCH HÀNG Ở ĐÂY (Thay số 5 bằng ID thật của tài khoản ông đã tạo)
        const userId = 3; 
        
        const { cartItems, totalAmount } = req.body; 

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống!' });
        }

        const customerInfo = await userRepo.getCustomerInfo(userId);
        if (!customerInfo) {
            return res.status(404).json({ message: 'Lỗi định danh! Không tìm thấy hồ sơ khách hàng.' });
        }

        // Gọi hàm thanh toán và trừ kho
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
        // 🔥 1. HARDCODE ID GIỐNG HỆT NHƯ BÊN CHECKOUT (VD: 3 là Superman)
        const userId = 3; 

        // 2. Lấy customer_id từ bảng customers
        const customerInfo = await userRepo.getCustomerInfo(userId);
        
        if (!customerInfo) return res.status(404).json({ message: 'Không tìm thấy hồ sơ!' });

        // 3. Truy vấn đơn hàng
        const history = await orderRepo.getOrdersByCustomerUuid(customerInfo.customer_id);

        res.json({ message: 'Lấy dữ liệu thành công', data: history });
    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}
};

module.exports = orderController;