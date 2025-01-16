const express = require("express");
const categoryRoute = require("./routers/categoryRoute");
const moviesRouter = require("./routers/moviesRouter");

const cors = require("cors");

const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"], // Include all custom headers used
  })
);

//Using routers
app.use("/", categoryRoute);
app.use("/", moviesRouter);

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
