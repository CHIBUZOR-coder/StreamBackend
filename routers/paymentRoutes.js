const paymentController = require("../controllers/paymentController");
const { auth } = require("../middlewares/auththen");
const express = require("express");
const router = express.Router();

router.post("/initiate_payment",   paymentController.initiateSubscription);
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;
