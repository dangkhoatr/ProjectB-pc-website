const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// --- API DÀNH CHO KHÁCH HÀNG ---
router.post("/public", productController.getPublicProducts);
router.post("/items", productController.getGroupedForBuildPC);
router.post("/detail/:id", productController.getById); 

// THÊM ĐƯỜNG DẪN NÀY ĐỂ TRANG SALE.HTML GỌI ĐƯỢC
router.post("/promo", productController.getPromoProducts);

// --- API DÀNH CHO ADMIN ---
router.post("/admin-all", productController.getAllForAdmin);
router.post("/add", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);

module.exports = router;