const express = require("express");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

router.post("/api/createCartegory", categoryController.createCategory);
router.get("/api/getCategory", categoryController.getCategory);
router.delete("/api/deleteCategory", categoryController.deleteCategory);
router.put("/api/updateCategory", categoryController.updateCategory);
module.exports = router;
