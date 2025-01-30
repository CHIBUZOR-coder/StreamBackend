const { generateToken } = require("../middlewares/generateToken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");

exports.createUser = async (req, res) => {
  const { email, phone, name, password, confirmpassword } = req.body;
  if (!email || !phone || !name || !password || !confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Validate passwords
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }
    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    // Validate file upload
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required." });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, "image");
    if (!imageUrl) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload image." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        image: imageUrl,
        phone,
      },
    });
    if (!newUser) {
      return res
        .status(400)
        .json({ success: false, message: "User registration failed." });
    }
    // Respond with success
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const uploadToCloudinary = async (fileBuffer, resourceType) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourceType, folder: "Users" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const result = await uploadPromise;
    console.log("Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Upload failed");
  }
};

exports.loginuser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("req body:", req.body);
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "All feilds must not be empty" });
    }
    // const user = await prisma.user.findUnique({ where: { email:email } });
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        password: true, // Include password for validation
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user does not exist" });
    }
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res
        .status(400)
        .json({ success: false, message: "password is incorrect" });
    }
    const token = generateToken(user);
    if (!token)
      return res.status(400).json({ success: false, message: "Invalid token" });

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/", // Make sure the path matches where the cookie was originally set
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("auth_token", token, {
      httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Set to true only in production (requires HTTPS)
      expires: new Date(Date.now() + 7200000), // 2 hours expiration for the cookie
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // SameSite=None for cross-origin requests in production
    });

    res.status(200);
    res.json({
      success: true,
      message: "You are now logged in",
      role: user.role,
      userInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        id: user.id,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
  }
};

const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1]; // Extract the last part: "image_id.jpg"
  const publicId = filename.split(".")[0]; // Remove the extension
  return `Users/${publicId}`; // Add the folder path back
};

//Update Profile
exports.updateProfile = async (req, res) => {
  const { name, Id, newEmail, password } = req.body;

  if (!name || !Id) {
    return res.status(400).json({
      success: false,
      message: "Name and Id fields must not be empty!",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(Id) },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res.status(400).json({
        success: false,
        message: "User password did not match!",
      });
    }

    let updateData = { name }; // Always initialize updateData

    if (req.file) {
      const publicId = getPublicIdFromUrl(user.image);
      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Unable to retrieve image URL from database",
        });
      }

      console.log(publicId);
      const imageUrl = await updateToCloudinary(
        req.file.buffer,
        "image",
        publicId
      );
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Unable to upload image to Cloudinary",
        });
      }

      updateData.image = imageUrl; // Assign image URL to updateData
    }

    if (newEmail) {
      updateData.email = newEmail; // Correctly assign new email
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided.",
      });
    }

    const updatedDetails = await prisma.user.update({
      where: { id: parseInt(Id) },
      data: updateData,
    });

    console.log("updateData:", updateData);

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      data: updatedDetails,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: "An error occurred while updating the profile",
    });
  }
};
exports.getUser = async (req, res) => {
  try {
    // Use req.params if ID is passed in the URL (e.g., /getUser/:id)
    const { id } = req.params;

    // Validate and parse the ID
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    console.log(user);

    return res.status(200).json({
      success: true,
      message: "User found successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateToCloudinary = async (
  fileBuffer,
  resourceType,
  publicId = null
) => {
  try {
    const uploadOptions = {
      resource_type: resourceType,
      folder: "Users",
    };

    if (publicId) {
      uploadOptions.public_id = publicId; // Replace the existing image
      uploadOptions.overwrite = true; // Allow overwriting the image
    }

    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        })
        .end(fileBuffer);
    });

    const result = await uploadPromise;
    console.log("Upload successful:", result);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Upload failed");
  }
};

exports.changePassword = async (req, res) => {
  const { email, password, newPassword, confirmpassword } = req.body;

  if (!email || !password || !newPassword) {
    return res.status(400).json({
      success: false,
      message:
        "one or more  feilds are missing from the form please make sure all feilds are not empty!",
    });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    if (confirmpassword !== newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password does not match" });
    }

    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res
        .status(400)
        .json({ success: false, message: "password is incorrect!" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
