const express = require("express");
const categoryRoute = require("./routers/categoryRoute");
const moviesRouter = require("./routers/moviesRouter");
const castRouter = require("./routers/castRouter");
const userRouter = require("./routers/userRouter");
const cookieParser = require("cookie-parser");
const favouriteCartRouter = require("./routers/favouriteCartRouter");
const watchCartRouter = require("./routers/watchRouter");
const paymentRouter = require("./routers/paymentRoutes");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();
const port = process.env.PORT;

// Body parsers
app.use(express.json({ limit: "10mb" })); // For JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For URL-encoded payloads
// Cookie parser  middleware
app.use(cookieParser());

// app.use(
//   cors({
//     origin: "https://stream-ashy-theta.vercel.app",

//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"], // Ensure it allows Authorization header if used
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Include OPTIONS for preflight requests
//   })
// );
const allowedOrigins = [
  "https://stream-ashy-theta.vercel.app", // Deployed React frontend
  "http://localhost:3000", // Local React dev
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl/postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Using routers
app.use("/", categoryRoute);
app.use("/", moviesRouter);
app.use("/", castRouter);
app.use("/", userRouter);
app.use("/", favouriteCartRouter);
app.use("/", paymentRouter);
app.use("/", watchCartRouter);

console.log("e de work oo");

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
