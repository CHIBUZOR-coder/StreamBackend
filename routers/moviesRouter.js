const express = require("express");
const movieController = require("../controllers/movieConteroller");
const uploads = require("../middlewares/uploads");

const router = express.Router();

router.post(
  "/api/createMovies",
  uploads.fields([
    { name: "image", maxCount: 1 }, // Expecting a single image file
    { name: "video", maxCount: 1 }, // Expecting a single video file
  ]),
  movieController.createMovies
);

module.exports = router;
