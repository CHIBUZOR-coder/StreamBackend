const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;
// console.log(SECRET_KEY);

function generateToken(user) {
  try {
    const { id, role, email, name, phone, image, password, userName } = user;
    console.log("user", user);
    let expp;
    if (!name) {
      console.log("Name is required");
    }
    if (!role) {
      console.log("role is required");
    }
    if (!email) {
      console.log("emal is required");
    }
    if (!id) {
      console.log("id is required");
    }
    if (!password) {
      console.log("passwordis required");
    }
    if (!phone) {
      console.log("phone is required");
    }

    // Payload data
    const payload = {
      id,
      role,
      email,
      name,
      phone,
      image,
      userName,
    };

    // Token options
    const options = {
      expiresIn: "2h", // Token validity duration (e.g., 2 hours.)
    };

    // Generate and return the token
    return jwt.sign(payload, SECRET_KEY, options);
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw error; // Rethrow the error to ensure the calling code handles it
  }
}

function ResetPasswordToken(user) {
  try {
    const { email, name } = user;
    console.log("user", user);

    if (!email) {
      console.log("emal is required");
    } else if (!name) {
      console.log("name is required");
    }

    // Payload data
    const payload = {
      email,
      name,
    };

    // Token options
    const options = {
      expiresIn: "15m", // Token validity duration (e.g., 2 hours)h
    };

    // Generate and return the token
    return jwt.sign(payload, SECRET_KEY, options);
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw error; // Rethrow the error to ensure the calling code handles it
  }
}

module.exports = { generateToken, ResetPasswordToken };
