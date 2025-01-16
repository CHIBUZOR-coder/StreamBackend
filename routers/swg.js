const categoryController = require("../controllers/categoryController");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/category:
 *    post:
 *       summary: create a categories
 *    requestBody: 
 *         required: true
 *    responses:
 *       201:
 *       content:
 *           application/json:
 *               schema:
 *                   type: array
 */
router.post("/api/category", categoryController.createCategory);

/**
 * @swagger
 * /api/categories:
 *    get:
 *       summary: Retrieve a list of categories
 *    responses:
 *       200:
 *           description: A list of categories.
 *       content:
 *           application/json:
 *               schema:
 *                   type: array
 */
router.get("/api/categories", categoryController.getcategory);

/**
 * @swagger
 * /api/categories/{id}/:
 *    get:
 *       summary: Retrieve a category
 *    responses:
 *       200:
 *           description: A category
 *       content:
 *           application/json:
 *               schema:
 *                   type: array
 */
router.get("/api/category/:id", categoryController.getSingleCategory);

/**
 * @swagger
 * /api/category/:id:
 *    put:
 *       summary: update a category
 *    requestBody: 
 *         required: true
 * 
 *    responses:
 *       200:
 *       content:
 *           application/json:
 *               schema:
 *                   type: array
 */
router.put("/api/category/:id", categoryController.updatecategory);

/**
 * @swagger
 * /api/category/:id:
 *    delete:
 *       summary: create a categories
 *    requestBody: 
 *         required: true
 *    responses:
 *       201:
 *       content:
 *           application/json:
 *               schema:
 *                   type: array
 */
router.delete("/api/category/:id", categoryController.deleteCategory);

module.exports = router;
