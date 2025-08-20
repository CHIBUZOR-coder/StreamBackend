const express = require("express");
const router = express.Router();
const favouriteCartController = require("../controllers/favouriteCartController");
router.post("/addfavourite", favouriteCartController.addToFavouriteCart);
router.get("/getfacouriteCart/:name", favouriteCartController.getFavourite);
router.delete("/deletefacouriteCart/:name", favouriteCartController.removeFavouriteMovie);
// Get favourite by body (React Native - POST with body)
router.post("/getfavouriteCart", favouriteCartController.getFavourite);

module.exports = router;
