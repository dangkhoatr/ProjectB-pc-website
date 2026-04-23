const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. API Lấy sản phẩm khuyến mãi (Đổi GET -> POST, query -> body)
router.post("/promo", async (req, res) => {
  try {
    // Lấy category từ Body thay vì Query trên URL
    const categoryQuery = req.body.category; 

    let sql = `
      SELECT id, name, slug, image, price, old_price, badge, description, category 
      FROM products
    `;
    let params = [];

    if (categoryQuery) {
      sql += ` WHERE category = ?`;
      params.push(categoryQuery);
    }

    // Lấy 6 sản phẩm mới nhất làm khuyến mãi
    sql += ` ORDER BY id DESC LIMIT 6`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi API Promo:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm khuyến mãi" });
  }
});

// 2. API Lấy toàn bộ sản phẩm (Đổi GET -> POST, query -> body)
router.post("/", async (req, res) => {
  try {
    let sql = `
      SELECT id, name, slug, image, price, old_price, badge, description, preset_json
      FROM products
      ORDER BY id DESC
    `;

    // Lấy giới hạn (limit) từ Body
    const limit = parseInt(req.body.limit);
    if (!isNaN(limit)) {
      sql += ` LIMIT ${limit}`;
    }

    const [rows] = await db.query(sql);

    const result = rows.map((item) => ({
      ...item,
      preset_json:
        typeof item.preset_json === "string"
          ? JSON.parse(item.preset_json)
          : item.preset_json
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
  }
});

// 3. API Lấy chi tiết sản phẩm theo Slug
// Đổi "/:slug" thành "/detail" vì mình không truyền slug trên URL nữa
router.post("/detail", async (req, res) => {
  try {
    // Lấy slug từ Body thay vì Params
    const { slug } = req.body;

    // Chặn lỗi nếu Frontend quên gửi slug
    if (!slug) {
      return res.status(400).json({ message: "Thiếu thông tin 'slug'" });
    }

    const [rows] = await db.query(
      `
      SELECT id, name, slug, image, price, old_price, badge, description, preset_json
      FROM products
      WHERE slug = ?
      LIMIT 1
      `,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const item = rows[0];
    item.preset_json =
      typeof item.preset_json === "string"
        ? JSON.parse(item.preset_json)
        : item.preset_json;

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm" });
  }
});

module.exports = router;