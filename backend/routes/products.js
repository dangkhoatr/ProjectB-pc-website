const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// 1. API LẤY DANH SÁCH SẢN PHẨM (Dùng cho index.html & build-pc.html)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { limit } = req.body;
        // Dùng AS để đổi tên cột mới (image_url) về tên cũ (image) cho Frontend hiểu
        let sql = `
            SELECT id, name, slug, image_url AS image, price, old_price, badge, description, category_id AS category, preset_json 
            FROM products 
            WHERE status IN ('active', 'sale')
            ORDER BY id DESC
        `;
        
        if (limit) {
            sql += ` LIMIT ${Number(limit)}`;
        }

        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Lỗi /api/products:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy sản phẩm!' });
    }
});

// ==========================================
// 2. API SẢN PHẨM KHUYẾN MÃI (Dùng cho sale.html)
// ==========================================
router.post('/promo', async (req, res) => {
    try {
        const { category } = req.body;
        let sql = `
            SELECT p.id, p.name, p.slug, p.image_url AS image, p.price, p.old_price, p.badge, p.description, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'sale' OR p.badge IN ('HOT', 'SALE')
        `;

        if (category) {
            sql += ` AND p.category_id = ${db.escape(category)}`;
        }
        sql += ` ORDER BY p.id DESC`;

        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Lỗi /api/products/promo:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy khuyến mãi!' });
    }
});

// ==========================================
// 3. API CHI TIẾT SẢN PHẨM (Dùng cho product-detail.html)
// ==========================================
router.post('/detail', async (req, res) => {
    try {
        const { slug } = req.body;
        const [rows] = await db.query(`
            SELECT id, name, slug, image_url AS image, price, old_price, badge, description, category_id AS category 
            FROM products 
            WHERE slug = ?
        `, [slug]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm này' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Lỗi /api/products/detail:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết!' });
    }
});

module.exports = router;