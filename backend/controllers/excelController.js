const db = require("../db");
const XLSX = require("xlsx");

const excelController = {
    importProducts: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: "Không tìm thấy file!" });

            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (data.length === 0) return res.status(400).json({ message: "File Excel trống!" });

            let countInsert = 0;
            let countUpdate = 0;

            for (const row of data) {
                const id = row["product_id"];
                const name = row["name"] || row["Tên sản phẩm"];
                if (!name && !id) continue;

                const category_id = row["category_id"] || "other";
                const price = Number(row["price"]) || 0;
                const qtyAdd = Number(row["quantity_add"]) || 0;
                
                // Tạo slug chuẩn SEO
                const slug = name 
                    ? (name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(1000 + Math.random() * 9000)) 
                    : "";

                let exists = false;
                if (id) {
                    const [check] = await db.query("SELECT id FROM products WHERE id = ?", [id]);
                    if (check.length > 0) exists = true;
                }

                if (exists) {
                    // CẬP NHẬT: stock, price, name, category_id theo đúng thứ tự WHERE id = ?
                    await db.query(
                        `UPDATE products SET stock = stock + ?, price = ?, name = ?, category_id = ? WHERE id = ?`,
                        [qtyAdd, price, name, category_id, id]
                    );
                    countUpdate++;
                } else {
                    // THÊM MỚI: Truyền đủ 5 giá trị cho 5 dấu hỏi theo đúng thứ tự cột
                    await db.query(
                        `INSERT INTO products (category_id, name, slug, price, stock, status) 
                         VALUES (?, ?, ?, ?, ?, 'active')`,
                        [category_id, name, slug, price, qtyAdd] // <-- ĐÃ THÊM SLUG VÀO ĐÚNG VỊ TRÍ!
                    );
                    countInsert++;
                }
            }

            res.json({ message: `Thành công rực rỡ! Tạo mới ${countInsert} và cộng dồn ${countUpdate} món!` });

        } catch (error) {
            console.error("🔥 Lỗi Import SQL:", error);
            res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
        }
    },

    importCustomers: async (req, res) => {
        res.json({ message: "Tính năng nhập khách hàng đang được hoàn thiện!" });
    }
};

module.exports = excelController;