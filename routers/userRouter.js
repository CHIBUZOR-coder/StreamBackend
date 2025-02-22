const express = require("express");
const router = express.Router();
const uploads = require("../middlewares/uploads");
const userControllers = require("../controllers/userController");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const {
  verifyToken,
  verifyAdmin,
  verifySubscription,
} = require("../middlewares/Verification");
const prisma = new PrismaClient();

//router
router.post(
  "/api/register",
  uploads.single("image"),
  userControllers.createUser
);

router.post("/login", userControllers.loginuser);
router.post("/verifyEmail", userControllers.verifyEmail);

router.post("/clear-cookies", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true, // Must be true for cross-origin cookies
    sameSite: "None", // Required for cross-origin requests
    path: "/", // Ensures it clears across all paths
    credentials: true,
  });

  res.status(200).json({ success: true, message: "Cookies cleared" });
});

// router.get("/api/protectedRoute", verifyToken, (req, res) => {
//   let userInfo;
//   res.status(200);
//   res.json({
//     success: true,
//     message: "You have accessed a protected route.",
//     userInfo: req.user, // Contains user data from decoded token
//   });
// });

router.get("/api/protectedRoute", verifyToken, async (req, res) => {
  try {
    // Fetch user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // User ID from decoded token
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "You have accessed a protected route.",
      userInfo: user // Includes subscription details
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});


router.get("/api/protectedRouteII", verifyToken, async (req, res) => {
  try {
    // Fetch user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // User ID from decoded token
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "You have accessed a protected route II.",
      userInfo: req.user, // Includes subscription details
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/subscriptionCheck", verifySubscription, async (req, res) => {
  try {
    // Fetch user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userReceipt = await prisma.receipt.findFirst({
      where: { userId: user.id },
      select: {
        created_at: true,
      },
    });

    // const userReciept = await prisma.receipt.findFirst({
    //   where: { userId: user.id },
    //   orderBy: { created_at: "desc" }, // Get latest receipt
    //   select: { created_at: true },
    // });

    if (!userReceipt) {
      return res.status(404).json({
        success: false,
        message:
          "Unable to continue verirfication check. User recipt not found",
      });
    }

    const favouritCart = await prisma.favouriteCart.findFirst({
      where: { userId: user.id },
      include: { favouriteCartMovies: true },
    });

    let expirationDate = new Date(userReceipt.created_at);
    expirationDate.setMonth(expirationDate.getMonth() + 1); // Add 1 month

    const currentDate = new Date();
    const remainingSubscriptionTime = expirationDate - currentDate;

    if (currentDate.getTime() > expirationDate.getTime()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscription: "UNSUBSCRIBED" },
      });
      return res.status(400).json({
        success: false,
        message:
          "Your subscription has expired. Please renew your subscription to gain access to our services.",
      });
    }

    console.log(Math.floor(remainingSubscriptionTime / (1000 * 60 * 60 * 24)));

    return res.status(200).json({
      success: true,
      message: "User subscription is still active.",
      remainingDays: Math.floor(
        remainingSubscriptionTime / (1000 * 60 * 60 * 24)
      ),
      cart: favouritCart, // Convert ms to days
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.put(
  "/updateProfile",
  uploads.single("image"),
  userControllers.updateProfile
);

router.put("/updatepassword", userControllers.changePassword);
router.get("/getUser/:name", userControllers.getUser);
router.get("/getAdmin/:name", verifyAdmin, userControllers.getUser);
router.get("/getAllUser", userControllers.getAllUsers);
router.delete("/deleteUser", userControllers.deleteUser);
router.post("/accountRecovery", userControllers.accountRecovery);
router.post("/resetPassword/:token", userControllers.resetPassword);
router.get("/subscriptionDetails/:name", userControllers.subscriptionDetails);

module.exports = router;
//Amakababe00$
