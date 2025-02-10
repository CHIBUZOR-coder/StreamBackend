const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

async function testEmail() {
  try {
    await transporter.verify();
    console.log("✅ Email credentials are working!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testEmail();
