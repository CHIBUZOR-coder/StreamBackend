const express = require("express");
const router = express.Router();
const favouriteCartController = require("../controllers/favouriteCartController");
router.post("/addfavourite", favouriteCartController.addToFavouriteCart);
router.get("/getfacouriteCart/:name", favouriteCartController.getFavourite);
router.delete("/deletefacouriteCart/:name", favouriteCartController.removeFavouriteMovie);

module.exports = router;
