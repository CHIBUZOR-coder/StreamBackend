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

app.use(
  cors({
    origin: "https://stream-ashy-theta.vercel.app",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Ensure it allows Authorization header if used
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Include OPTIONS for preflight requests
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
