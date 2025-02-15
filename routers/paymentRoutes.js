const paymentController = require("../controllers/paymentController");
const { auth } = require("../middlewares/auththen");
const express = require("express");
const router = express.Router();

router.post("/initiate_payment",   paymentController.initiateSubscription);
router.post("/verify", paymentController.verifyPaymentt);
router.post("/Unsubscribe", paymentController.Unsubscribe);

module.exports = router;
