const db = require('../db');

const productController = {
    // 1. ADMIN
    getAllForAdmin: async (req, res) => {
        try {
            // Thay JOIN thành LEFT JOIN đề phòng lỗi mất sản phẩm nếu lỡ xóa danh mục
            const [rows] = await db.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`);
            const formatted = rows.map(r => ({
                ...r, category: r.category_id,
                badge: r.badge,
                description: r.description, // <--- Lôi mô tả ra
                preset_json: typeof r.preset_json === 'string' ? JSON.parse(r.preset_json) : (r.preset_json || {})
            }));
            res.json(formatted);
        } catch (error) { res.status(500).json({ message: "Lỗi Server Admin" }); }
    },

    // 2. PUBLIC - TRANG CHỦ
    getPublicProducts: async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM products WHERE status IN ('active', 'sale') ORDER BY id DESC`);
            const formatted = rows.map(r => ({
                id: r.id, name: r.name, category: r.category_id, price: Number(r.price), old_price: r.old_price ? Number(r.old_price) : null,
                image: r.image_url, status: r.status,
                badge: r.badge,
                specs: typeof r.preset_json === 'string' ? JSON.parse(r.preset_json) : (r.preset_json || {})
            }));
            res.json(formatted);
        } catch (error) { res.status(500).json({ message: "Lỗi lấy data" }); }
    },

    // 3. PUBLIC - SALE.HTML
    getPromoProducts: async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM products WHERE status = 'sale' AND stock > 0 ORDER BY id DESC`);
            const formatted = rows.map(r => ({
                id: r.id, name: r.name, category: r.category_id, price: Number(r.price), old_price: r.old_price ? Number(r.old_price) : null,
                image: r.image_url, status: r.status,
                badge: r.badge,
                specs: typeof r.preset_json === 'string' ? JSON.parse(r.preset_json) : (r.preset_json || {})
            }));

            const body = req.body || {};
            let result = formatted;
            if (body.category) result = result.filter(p => p.category === body.category);
            else if (body.categories && Array.isArray(body.categories)) result = result.filter(p => body.categories.includes(p.category));
            else if (body.group === 'gears') result = result.filter(p => ['keyboard', 'mouse', 'headset'].includes(p.category));
            else if (body.group === 'cooling') result = result.filter(p => ['fan', 'aircool', 'aio', 'custom'].includes(p.category));

            res.json(result);
        } catch (error) { res.status(500).json({ message: "Lỗi data promo" }); }
    },

    // 4. PUBLIC - CHI TIẾT
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.query(`SELECT * FROM products WHERE id = ?`, [id]);
            if (rows.length === 0) return res.status(404).json({ message: "Không thấy sản phẩm" });
            const p = rows[0];
            res.json({
                ...p, image: p.image_url,
                badge: p.badge,
                description: p.description, // <--- Trả mô tả về cho Frontend hiển thị
                specs: typeof p.preset_json === 'string' ? JSON.parse(p.preset_json) : (p.preset_json || {})
            });
        } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
    },

    // 5. PUBLIC - BUILD PC
    getGroupedForBuildPC: async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM products WHERE status != 'out_of_stock' AND stock > 0`);
            const grouped = {};
            rows.forEach((row) => {
                const cat = row.category_id;
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push({ id: row.id, name: row.name, price: Number(row.price), image: row.image_url || "", badge: row.badge });
            });
            res.json(grouped);
        } catch (error) { res.status(500).json({ message: "Lỗi Build PC" }); }
    },

    // 6. CREATE (Đã thêm description)
    create: async (req, res) => {
        try {
            // Khai báo thêm biến description ở đây
            const { category_id, name, description, price, stock, status, badge, image_url, preset_json } = req.body;
            const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);
            
            // Bồi thêm description vào câu SQL
            await db.query(
                `INSERT INTO products (category_id, name, slug, description, price, stock, status, badge, image_url, preset_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [category_id, name, slug, description || null, price, stock, status, badge || null, image_url, JSON.stringify(preset_json)]
            );
            res.status(201).json({ message: "Thêm thành công!" });
        } catch (error) { 
            console.error(error);
            res.status(500).json({ message: "Lỗi thêm sản phẩm" }); 
        }
    },

    // 7. UPDATE (Đã thêm description)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            // Khai báo thêm biến description ở đây
            const { category_id, name, description, price, stock, status, badge, image_url, preset_json } = req.body;
            
            // Bồi thêm description vào câu SQL
            await db.query(
                `UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, status=?, badge=?, image_url=?, preset_json=? WHERE id=?`,
                [category_id, name, description || null, price, stock, status, badge || null, image_url, JSON.stringify(preset_json), id]
            );
            res.json({ message: "Cập nhật thành công!" });
        } catch (error) { 
            console.error(error);
            res.status(500).json({ message: "Lỗi cập nhật" }); 
        }
    },

    // 8. DELETE
    delete: async (req, res) => {
        try {
            await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
            res.json({ message: "Đã xóa!" });
        } catch (error) { res.status(500).json({ message: "Lỗi xóa" }); }
    }
};

module.exports = productController;