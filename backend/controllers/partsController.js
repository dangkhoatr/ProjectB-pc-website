const partsRepo = require('../repositories/partsRepo');

const partsController = {
  // 1. Xử lý API /categories
  getCategories: async (req, res) => {
    try {
      const rows = await partsRepo.getAllCategories();
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi lấy danh mục linh kiện" });
    }
  },

  // 2. Xử lý API /items (Gom nhóm dữ liệu)
  getItems: async (req, res) => {
    try {
      const rows = await partsRepo.getAllItems();
      
      // Logic gom nhóm của ông
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
  },

  // 3. Xử lý API /items/by-key
  getItemsByKey: async (req, res) => {
    try {
      const key = req.body.key; 

      if (!key) {
        return res.status(400).json({ message: "Thiếu trường dữ liệu 'key'" });
      }

      const rows = await partsRepo.getItemsByKey(key);
      
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
  }
};

module.exports = partsController;