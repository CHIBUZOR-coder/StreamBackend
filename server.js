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
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"], // Include all custom headers used
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
