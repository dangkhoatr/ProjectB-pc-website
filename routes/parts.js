const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Lấy toàn bộ category (Chỉ cần đổi GET thành POST)
router.post("/categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, part_key, label FROM part_categories ORDER BY id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh mục linh kiện" });
  }
});

// 2. Lấy toàn bộ item, group theo part_key (Chỉ cần đổi GET thành POST)
router.post("/items", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pc.part_key, pc.label, pi.id, pi.name, pi.price, pi.image
      FROM part_items pi
      JOIN part_categories pc ON pi.category_id = pc.id
      ORDER BY pc.id ASC, pi.id ASC
    `);

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.part_key]) grouped[row.part_key] = [];
      grouped[row.part_key].push({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        image: row.image || ""
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách linh kiện" });
  }
});

// 3. Lấy item theo part_key
// ĐỔI TÊN ĐƯỜNG DẪN: Bỏ chữ "/:key" đi, vì POST không truyền trên URL nữa
router.post("/items/by-key", async (req, res) => {
  try {
    // MẤU CHỐT Ở ĐÂY: Lấy key từ req.body thay vì req.params
    const key = req.body.key; 

    // Kiểm tra xem Frontend có gửi key lên không
    if (!key) {
        return res.status(400).json({ message: "Thiếu trường dữ liệu 'key'" });
    }

    const [rows] = await db.query(
      `
      SELECT pi.id, pi.name, pi.price, pi.image
      FROM part_items pi
      JOIN part_categories pc ON pi.category_id = pc.id
      WHERE pc.part_key = ?
      ORDER BY pi.id ASC
      `,
      [key]
    );

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        image: row.image || ""
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy linh kiện theo loại" });
  }
});

module.exports = router;