const express = require("express");
const router = express.Router();
const castController = require("../controllers/castController");
const uploads = require("../middlewares/uploads");

// Allow dynamic fields and files
router.post(
  "/api/addCast",
  uploads.any(), // Accept all fields and files dynamically
  castController.AddCast
);

module.exports = router;
