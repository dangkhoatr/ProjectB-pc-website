const express = require("express");
const router = express.Router();
const partsController = require("../controllers/partsController");

// Phân luồng các đường dẫn thẳng vào Controller
router.post("/categories", partsController.getCategories);
router.post("/items", partsController.getItems);
router.post("/items/by-key", partsController.getItemsByKey);

module.exports = router;