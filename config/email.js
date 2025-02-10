const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const hostUser = process.env.EMAIL_HOST_USER;
const host = process.env.EMAIL_HOST;
const pass = process.env.EMAIL_HOST_PASSWORD;
console.log("User:", hostUser);
console.log("host:", host);
console.log("pass:", pass);

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

module.exports = transporter;
