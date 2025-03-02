const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const hostUser = process.env.EMAIL_HOST_USER;
const host = process.env.EMAIL_HOST;
const pass = process.env.EMAIL_HOST_PASSWORD;
// console.log("User:", hostUser);
// console.log("host:", host);
// console.log("pass:", pass);

// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_HOST,
//   auth: {
//     user: process.env.EMAIL_HOST_USER,
//     pass: process.env.EMAIL_HOST_PASSWORD,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use 465 if using SSL
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


module.exports = transporter;
