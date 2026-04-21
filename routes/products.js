const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/promo", async (req, res) => {
  try {
    const categoryQuery = req.query.category; 

    // Bổ sung thêm cột category vào truy vấn
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

router.get("/", async (req, res) => {
  try {
    let sql = `
      SELECT id, name, slug, image, price, old_price, badge, description, preset_json
      FROM products
      ORDER BY id DESC
    `;

    // Tinh chỉnh: Cho phép giới hạn số lượng sản phẩm (VD: ?limit=4 cho trang chủ)
    const limit = parseInt(req.query.limit);
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


router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

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