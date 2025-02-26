const express = require("express");
const router = express.Router();
const watchController = require("../controllers/watchController");

router.post("/addwatchCount", watchController.addToWatchCount);
router.get("/getWatchCount", watchController.getWatchCount);

module.exports = router;
