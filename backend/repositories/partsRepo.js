const db = require('../db');

const partsRepo = {
  // 1. Lấy toàn bộ danh mục
  getAllCategories: async () => {
    const [rows] = await db.query("SELECT id, part_key, label FROM part_categories ORDER BY id ASC");
    return rows;
  },

  // 2. Lấy toàn bộ linh kiện (Chưa gom nhóm)
  getAllItems: async () => {
    const [rows] = await db.query(`
      SELECT pc.part_key, pc.label, pi.id, pi.name, pi.price, pi.image
      FROM part_items pi
      JOIN part_categories pc ON pi.category_id = pc.id
      ORDER BY pc.id ASC, pi.id ASC
    `);
    return rows;
  },

  // 3. Lấy linh kiện theo part_key cụ thể
  getItemsByKey: async (key) => {
    const [rows] = await db.query(`
      SELECT pi.id, pi.name, pi.price, pi.image
      FROM part_items pi
      JOIN part_categories pc ON pi.category_id = pc.id
      WHERE pc.part_key = ?
      ORDER BY pi.id ASC
    `, [key]);
    return rows;
  }
};

module.exports = partsRepo;