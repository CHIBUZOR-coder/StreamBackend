const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const prisma = new PrismaClient();

dotenv.config();

// authenticate a user
async function auth(req, res, next) {
  const token = req.header("auth-token");

  try {
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "You are not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { email: true, id: true, password: true },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Your session has expired. Please log in again.",
        });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid token. Please log in again.",
        });
    }

    console.log({ message: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// give authorization to a user who is an admin
async function admin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ succes: false, message: "Forbidden" });
  }
  next();
}

module.exports = { auth, admin };

// async function auth (req, res, next ) {
//     const token = req.header("auth-token")
//     try {
//         if(!token){
//             return res.status(401).json({ success: false, message: "You are not authorized"})
//         }else {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
//             const user = await prisma.user.findUnique({ where: { id: decoded.id}, select: {email: true, id: true, password: true}})
//             req.user= user
//             next()
//         }
//     } catch (error) {
//         console.log({ message: error.message })
//     }
// }
