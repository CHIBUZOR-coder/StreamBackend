const express = require("express");
const movieController = require("../controllers/movieConteroller");
const uploads = require("../middlewares/uploads");

const router = express.Router();

router.post(
  "/api/createMovies",
  uploads.fields([
    { name: "image", maxCount: 10 }, 
    { name: "video", maxCount: 10 }, 
  ]),
  movieController.createMovies
);
router.get("/api/getMovies", movieController.getMovies);
router.put("/api/updateMovie", movieController.UpdateMovie);
router.delete("/api/deletSingleMovie", movieController.deleteSingle);
router.delete("/api/deletAllMovie", movieController.deleteAllMovie);
module.exports = router;
