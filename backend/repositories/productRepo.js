const db = require('../db');

// Chỉ làm đúng 1 việc: Chạy SQL lưu sản phẩm
async function createProduct(productData) {
    const { category_id, name, price, stock, image_url } = productData;
    const [result] = await db.query(
        `INSERT INTO products (category_id, name, price, stock, image_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [category_id, name, price, stock, image_url]
    );
    return result.insertId;
}

module.exports = { createProduct };