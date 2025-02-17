const express = require("express");
const categoryRoute = require("./routers/categoryRoute");
const moviesRouter = require("./routers/moviesRouter");
const castRouter = require("./routers/castRouter");
const userRouter = require("./routers/userRouter");
const cookieParser = require("cookie-parser");
const favouriteCartRouter = require("./routers/favouriteCartRouter");
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

// CORS Configuration
// app.use(
//   cors({
//     origin: "https://stream-ashy-theta.vercel.app/", // Allow requests from this origin
//     credentials: true, // Allow cookies and credentials
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization", "auth-token"], // Include all custom headers used
//   })
// );

// app.use(
//   cors({
//     origin: "https://stream-m1p80bn1b-zoes-projects-c78d3faa.vercel.app", 
//     credentials: true, // ✅ Allow cookies
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "auth-token"], 
//   })
// );

app.use(
  cors({
    origin: "https://stream-m1p80bn1b-zoes-projects-c78d3faa.vercel.app",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);




// Using routers
app.use("/", categoryRoute);
app.use("/", moviesRouter);
app.use("/", castRouter);
app.use("/", userRouter);
app.use("/", favouriteCartRouter);
app.use("/", paymentRouter);

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
