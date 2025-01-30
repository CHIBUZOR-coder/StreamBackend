const express = require("express");
const router = express.Router();
const uploads = require("../middlewares/uploads");
const userControllers = require("../controllers/userController");
const { verifyToken } = require("../middlewares/Verification");

//router
router.post(
  "/api/register",
  uploads.single("image"),
  userControllers.createUser
);

router.post("/login", userControllers.loginuser);

router.post("/clear-cookies", (req, res) => {
  // Clear the cookie by specifying the cookie name and other options
  res.clearCookie("auth_token", {
    httpOnly: true, // Ensures the cookie is not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent only over HTTPS in production
    sameSite: "Strict", // Adds security to prevent cross-site request forgery (CSRF)
  });

  // Send a success response to the client
  res.status(200).json({ success: true, message: "Cookies cleared" });
});

router.get("/api/protectedRoute", verifyToken, (req, res) => {
  let userInfo;
  res.status(200);
  res.json({
    success: true,
    message: "You have accessed a protected route.",
    userInfo: req.user, // Contains user data from decoded token
  });
});

router.put(
  "/updateProfile",
  uploads.single("image"),
  userControllers.updateProfile
);

router.get("/getUser/:id", userControllers.getUser);

module.exports = router;
//Amakababe00$
