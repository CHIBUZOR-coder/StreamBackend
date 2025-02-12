const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
// const fetch = require("node-fetch");
const transporter = require("../config/email");
dotenv.config();
const prisma = new PrismaClient();
const FLW_SECRET_KEY = process.env.FLW_SECRETE_KEY;

console.log(FLW_SECRET_KEY);

exports.initiateSubscription = async (req, res) => {
  const { email, plan_id } = req.body;
  const parsedPlanId = parseInt(plan_id, 10);

  console.log("🔢 Parsed plan_id:", parsedPlanId);
  try {
    // console.log("✅ Request received with body:", req.body);

    if (!req.body) {
      console.error("❌ Request body is undefined");
      return res
        .status(400)
        .json({ success: false, message: "Request body is missing" });
    }

    if (!email || !plan_id) {
      console.warn("⚠️ Validation failed: Missing email or plan_id");
      return res.status(400).json({
        success: false,
        message: "Email and plan_id are required",
      });
    }

    console.log("🔎 Checking if FLW_SECRET_KEY exists...");

    const redirectUrl =
      process.env.REDIRECT_URL || "http://localhost:5173/stream/thankyou";

    console.log(`🔍 Searching for user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!user) {
      console.warn(`❌ User not found for email: ${email}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("✅ User found:", user);

    if (!user.email || !user.name || !user.phone) {
      console.warn("⚠️ User data is incomplete:", user);
      return res.status(400).json({
        success: false,
        message: "User data is incomplete or missing required fields",
      });
    }

    const orderId = uuidv4();
    console.log("📌 Generated Order ID:", orderId);

    const subscriptionData = {
      tx_ref: orderId,
      amount: 300,
      currency: "USD",
      payment_type: "subscription",
      redirect_url: redirectUrl,
      customer: {
        email: user.email,
        name: user.name,
        phonenumber: user.phone,
      },
      plan: parsedPlanId,
    };

    console.log("Sending subscription data to Flutterwave:", subscriptionData);

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log("⏳ Awaiting response from Flutterwave...");
    const data = await response.json();
    console.log("📩 Flutterwave response:", data);

    if (data.status === "success") {
      return res.status(200).json({
        success: true,
        message: "Subscription initiated successfully",
        payment_link: data.data.link,
        orderId,
      });
    } else {
      console.error("❌ Flutterwave API error:", data);
      return res.status(500).json({
        success: false,
        message: data.message || "Subscription initiation failed",
      });
    }
  } catch (error) {
    console.error("🔥 Subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Subscription initiation failed due to an internal error",
    });
  }
};

// Separate function for sending payment email
const sendPaymentEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: email,
    subject: "Notification of Payment",
    html: `
      <div style="width: 100%; max-width: 600px; margin: auto; text-align: center; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') no-repeat center; background-size: cover; height: 300px;"></td>
          </tr>
        </table>
        <div style="padding: 20px; color: #0B0F29;">
          <p style="font-size: 16px;">Payment has been made successfully</p>
        </div>
      </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Payment email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

exports.verifyPayment = async (req, res) => {
  const { transaction_id, orderId, email } = req.body;

  if (!transaction_id || !orderId || !email) {
    return res.status(400).json({
      success: false,
      message: "transaction_Id, orderId, and email are required",
    });
  }

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    if (!data.data || data.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Payment failed" });
    }

    console.log(data);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const meta = data.data?.meta || {};
    console.log("Flutterwave response:", JSON.stringify(data, null, 2));

    // Create receipt in a transaction
    let receipt;

    // Check if receipt already exists for this specific order
    const existingReceipt = await prisma.receipt.findFirst({
      where: { userId: user.id, orderId: orderId },
    });

    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        message: "Receipt has already been created for this transaction!",
      });
    }

  
    try {
      receipt = await prisma.receipt.create({
        data: {
          userId: user.id,
          orderId: orderId,
          name: data.data.customer.name || user.name,
          email: data.data.customer.email || user.email,
          phone: data.data.customer.phone || user.phone,
          amount: data.data.amount,
          transactionId: transaction_id,
          status: "COMPLETED",
        },
        // include: { user: true },
      });
    } catch (error) {
      console.error("Error creating receipt:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create receipt",
      });
    }

    // Send email and update user subscription in parallel
    await Promise.all([
      sendPaymentEmail(data.data.customer.email),
      prisma.user.update({
        where: { email: user.email },
        data: { subscription: "SUBSCRIBED" },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Receipt created successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};
