const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Save OTP in the database
 * @param {string} email - user email
 * @param {string} otp - generated OTP
 */
async function saveOtp(email, otp) {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // expires in 10 minutes

  // Upsert OTP for this email (update if exists, otherwise create)
  await prisma.otp.upsert({
    where: { email },
    update: { otp, expiresAt, createdAt: new Date() },
    create: { email, otp, expiresAt },
  });
}

/**
 * Verify OTP for a user
 * @param {string} email - user email
 * @param {string} otp - provided OTP
 * @returns {boolean} true if valid, false otherwise
 */
async function verifyOtp(email, otp) {
  const record = await prisma.otp.findUnique({
    where: { email },
  });

  if (!record) return false;

  // Check if OTP is expired
  if (record.expiresAt < new Date()) {
    await prisma.otp.delete({ where: { email } }); // Clean up expired OTP
    return false;
  }

  const isValid = record.otp === otp;

  if (isValid) {
    // Remove OTP after successful verification
    await prisma.otp.delete({ where: { email } });
  }

  return isValid;
}

module.exports = { saveOtp, verifyOtp };
