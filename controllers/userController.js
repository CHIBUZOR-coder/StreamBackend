const {
  generateToken,
  ResetPasswordToken,
} = require("../middlewares/generateToken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");
const transporter = require("../config/email");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const { verifyOtp, saveOtp } = require("../config/otpStore");
const crypto = require("crypto");



//render is not recognising my prisma migrations. so i use an old field resetToken which is either true of false checking if user has been verified by email
// exports.createUser = async (req, res) => {
//   const { email, phone, userName, name, password, confirmpassword } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required.",
//     });
//   } else if (!phone) {
//     return res.status(400).json({
//       success: false,
//       message: "phone number is required!",
//     });
//   } else if (!name) {
//     return res.status(400).json({
//       success: false,
//       message: "name is required!",
//     });
//   } else if (!password) {
//     return res.status(400).json({
//       success: false,
//       message: "password is required!",
//     });
//   } else if (!confirmpassword) {
//     return res.status(400).json({
//       success: false,
//       message: "confirmpassword is required!",
//     });
//   } else if (!userName) {
//     return res.status(400).json({
//       success: false,
//       message: "confirmpassword is required!",
//     });
//   }

//   console.log("body:", req.body);

//   try {
//     // Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format.",
//       });
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists.",
//       });
//     }

//     const passwordRegex = /^[A-Z](?=.*[\W_])/;
//     // ^[A-Z]       -> Ensures the password starts with a capital letter
//     // (?=.*[\W_])  -> Ensures at least one special character (non-alphanumeric)

//     if (!passwordRegex.test(password)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must start with a capital letter and contain at least one special character.",
//       });
//     }
//     // Validate passwords
//     if (password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters.",
//       });
//     }
//     if (password !== confirmpassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Passwords do not match.",
//       });
//     }

//     let imageUrl;

//     // Validate file upload
//     if (req.file) {
//       console.log("file", req.file);
//       imageUrl = await uploadToCloudinary(req.file.buffer, "image");
//       if (!imageUrl) {
//         return res.status(500).json({
//           success: false,
//           message: "Failed to upload image.",
//         });
//       }
//     }

//     // Upload image to Cloudinary

//     // Hash password
//     const salt = await bcrypt.genSalt(11);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Generate email verification token
//     const verifyEmailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
//       expiresIn: "1h",
//     });

//     // Create user in the database (set isVerified to false initially)
//     const newUser = await prisma.user.create({
//       data: {
//         email,
//         name,
//         password: hashedPassword,
//         image: imageUrl || null,
//         phone,
//         userName,
//       },
//     });

//     if (!newUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User registration failed.",
//       });
//     }

//     // Send verification email
//     const verificationLink = `https://stream-ashy-theta.vercel.app/verifyEmail?token=${verifyEmailToken}`;

//     await sendVerificationEmail(email, verificationLink);

//     return res.status(201).json({
//       success: true,
//       message: `User registered successfully. Please check ${email} for verification.`,
//       user: {
//         id: newUser.id,
//         email: newUser.email,
//         name: newUser.name,
//         image: newUser.image,
//         userName: userName,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating user:", error.message);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };





exports.createUser = async (req, res) => {
  const { email, phone, userName, name, password, confirmpassword, platform } =
    req.body;

  if (!email || !phone || !userName || !name || !password || !confirmpassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Password validation
    const passwordRegex = /^[A-Z](?=.*[\W_])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter and contain at least one special character.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image");
      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image.",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in DB with isVerified false
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        image: imageUrl,
        phone,
        userName,
        isVerified: false,
      },
    });

    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "User registration failed.",
      });
    }

    // Logic split: Web vs Mobile
    if (platform === "mobile") {
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

      // Send OTP email
      await sendOtpEmail(email, otp);
      saveOtp(email, otp);
      return res.status(201).json({
        success: true,
        message: `User registered successfully. An OTP has been sent to ${email} for verification.`,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          userName: newUser.userName,
        },
      });
    } else {
      // Web flow: Send email verification link
      const verifyEmailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
        expiresIn: "1h",
      });

      const verificationLink = `https://stream-ashy-theta.vercel.app/verifyEmail?token=${verifyEmailToken}`;
      await sendVerificationEmail(email, verificationLink);

      return res.status(201).json({
        success: true,
        message: `User registered successfully. Please check ${email} for verification link.`,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          userName: newUser.userName,
        },
      });
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Asynchronous function to send email
const sendVerificationEmail = async (email, verificationLink) => {
  const mailOptions = {
    from: {
      name: "Stream",
      address: process.env.EMAIL_HOST_USER,
    },
    to: email,
    subject: "Email Verification",
    html: `
      <div style="width: 100%; height:600px; max-width: 600px; margin: auto; text-align: center;
      font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
          <tr>
            <td style="background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') 
            no-repeat center center; background-size: cover;"></td>
          </tr>
        </table>
        <div style="padding: 20px; color:  #0B0F29;">
          <p style="font-size: 16px;">Click the button below to verify your email. This link is valid for 1 hour.</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #0B0F29; 
          border: 5px solid #0B0F29; color: #F20000; text-decoration: none; font-weight: bold; border-radius: 5px;"
          onmouseover="this.style.background='#FFF'; this.style.color='#0B0F29';"
          onmouseout="this.style.background='#0B0F29'; this.style.color='#F20000';">Verify Email</a>
          <p style="margin-top: 20px; font-size: 14px; color:  #0B0F29;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};

//send otp
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: "Stream",
      address: process.env.EMAIL_HOST_USER,
    },
    to: email,
    subject: "Email Verification",
    html: `
      <div style="width: 100%; height:600px; max-width: 600px; margin: auto; text-align: center;
      font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
          <tr>
            <td style="background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') 
            no-repeat center center; background-size: cover;"></td>
          </tr>
        </table>
        <div style="padding: 20px; color:  #0B0F29;">
          <p style="font-size: 16px;">Click the button below to verify your email. This link is valid for 1 hour.</p>
          <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
          <p style="margin-top: 20px; font-size: 14px; color:  #0B0F29;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
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

// exports.verifyEmail = async (req, res) => {
//   const { token } = req.body;
//   console.log("req.body:", req.body);

//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Token and email are required",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // Use your JWT secret key

//     if (!decoded) {
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     }
//     // Extract email
//     const { email } = decoded;

//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: { id: true },
//     });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Unable to find user" });
//     }

//     // Update user in database (set resetToken to true or handle verification logic)
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { status: true },
//     });

//     // If verification is successful, send a success response
//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully",
//       data: decoded, // Optionally send decoded data
//     });
//   } catch (error) {
//     console.error("Email verification error:", error.message);
//     return res
//       .status(500)
//       .json({ success: false, message: "Email verification failed" });
//   }
// };

exports.verifyEmail = async (req, res) => {
  const { token, otp, email } = req.body;

  if (!token && (!otp || !email)) {
    return res.status(400).json({
      success: false,
      message: "Provide either a token or email with OTP.",
    });
  }

  try {
    let verifiedEmail;

    if (token) {
      // --- Web token verification ---
      const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
      if (!decoded?.email) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
      verifiedEmail = decoded.email;
    } else if (otp && email) {
      // --- Mobile OTP verification ---
      const isValid = verifyOtp(email, otp);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }
      verifiedEmail = email;
    }

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: verifiedEmail },
      select: { id: true, status: true },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to find user",
      });
    }

    if (user.status === true) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
      });
    }

    // Update user status to verified
    await prisma.user.update({
      where: { id: user.id },
      data: { status: true },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

exports.loginuser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("req body:", req.body);
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields must not be empty" });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email },

      select: {
        status: true,
        id: true,
        role: true,
        userName: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        password: true,
        subscription: true,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    // Validate password
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect" });
    }

    // Initialize verification token
    let verifyEmailToken = "";

    // Handle unverified users gfg
    if (user.status !== true) {
      console.log("Unverified user");

      verifyEmailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
        expiresIn: "1h",
      });

      const verificationLink = `https://stream-ashy-theta.vercel.app/verifyEmail?token=${verifyEmailToken}`;
      sendVerificationEmail(email, verificationLink);

      return res.status(400).json({
        success: true,
        message:
          "You have not verified your email. A link to verify your accout has been sent to your emmail",
      });
    }

    // Generate authentication token
    const token = generateToken(user);
    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    // Clear previous authentication cookies
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    // Set new authentication cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7200000), // 2 hours expiration
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "You are now logged in",
      role: user.role,
      userInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        id: user.id,
        userName: user.userName,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    // Use req.params if ID is passed in the URL (e.g., /getUser/:id)
    const { name } = req.params;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user name" });
    }

    const user = await prisma.user.findUnique({ where: { name } });

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

exports.getAdmin = async (req, res) => {
  try {
    // Use req.params if ID is passed in the URL (e.g., /getUser/:id)
    const { name } = req.params;

    // Validate and parse the ID
    //  if (!id || Number.isNaN(Number(id))) {
    //    return res
    //      .status(400)
    //      .json({ success: false, message: "Invalid user ID" });
    //  }

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user name" });
    }

    const user = await prisma.user.findUnique({
      where: { name },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    if (user.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: " You are accessing an Unauthorized route!",
      });
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

//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const AllUsers = await prisma.user.findMany();

    if (!AllUsers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Unable to get All users" });
    }

    return res.status(200).json({
      success: true,
      message: "All users retrived successfully",
      data: AllUsers,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, message: error.message });
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

  console.log("body:", req.body);

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
        .json({ success: false, message: "Incorrect current password!" });
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

exports.deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    console.log("userId:", userId);

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "The feild userId is missing" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // 1. Delete all records from FavouriteCartMovies that reference the user's FavouriteCart
    const deletedFavouriteCartMovies =
      await prisma.favouriteCartMovies.deleteMany({
        where: {
          favouriteCart: {
            userId: user.id,
          },
        },
      });
    if (!deletedFavouriteCartMovies) {
      return res.status(400).json({
        success: false,
        message: "Unable to delete user  favouritecart",
      });
    }

    // 2. Delete all records from FavouriteCart that reference the user
    const FavouriteCart = await prisma.favouriteCart.deleteMany({
      where: { userId: user.id },
    });

    if (!FavouriteCart) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to delete favouritecart" });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Unable to delete user" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.watchCount = async (req, res) => {
  try {
  } catch (error) {}
};

exports.accountRecovery = async (req, res) => {
  const { email, platform } = req.body;

  const frontendUrl =
    platform === "web" ? process.env.FRONTEND_URL : process.env.MOBILE_URL;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        id: true,
        email: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "There is no user with the provided email!",
      });
    }

    // Generate a unique reset token
    // const resetToken = crypto.randomBytes(32).toString("hex");
    const resetToken = ResetPasswordToken(user);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
      },
    });

    const resetLink = `${frontendUrl}/resetPassword/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
 <div style="
    width: 100%;
    height:600px;
   
    max-width: 600px;
    margin: auto;
    text-align: center;
    font-family: Arial, sans-serif;
    border-radius: 10px;
    overflow: hidden;
">

    <!-- Background Image Section -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
      <tr>
        <td style="
          background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') no-repeat center center;
          background-size: cover;
       
        ">


     <br>
       <br>
         <br>
           <br>

        </td>
      </tr>
    </table>

    <!-- Main Content -->
    <div style="padding: 20px;  color:  #0B0F29;">
      <p style="font-size: 16px;">
        Click the button below to reset your password. This link is valid for 3 minuutes.
      </p>
     <a href="${resetLink}" 
    style="display: inline-block; padding: 12px 24px; background: #0B0F29; 
    border: 5px solid #0B0F29; color: #F20000; text-decoration: none; 
    font-weight: bold; border-radius: 5px;" 
    onmouseover="this.style.background='#FFF'; this.style.color='#0B0F29';"
    onmouseout="this.style.background='#0B0F29'; this.style.color='#F20000';">
    Reset Password
</a>

      <p style="margin-top: 20px; font-size: 14px; color:  #0B0F29;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  </div>
`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email!",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token!" });
    }

    // Find user by reset token and check if it's expired
    const user = await prisma.user.findUnique({
      where: { email: decoded.email, resetToken: token },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token!",
      });
    }

    const passwordRegex = /^[A-Z](?=.*[\W_])/;
    // ^[A-Z]       -> Ensures the password starts with a capital letter
    // (?=.*[\W_])  -> Ensures at least one special character (non-alphanumeric)

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must start with a capital letter and contain at least one special character.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords does not match!" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear the reset token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

exports.subscriptionDetails = async (req, res) => {
  let { name } = req.params;
  name = decodeURIComponent(name);

  try {
    const user = await prisma.user.findUnique({
      where: { name },
      select: { id: true, name: true },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // const user = await prisma.user.findFirst({
    //   where: {
    //     name: prisma.raw(`LOWER(name) = LOWER('${name}')`), // Convert to lowercase works in all database
    //   },
    // });
    console.log("user:", user);

    // const userReciept = await prisma.receipt.findFirst({
    //   where: { userId: user.id },
    // });
    const userReceipt = await prisma.receipt.findFirst({
      where: { userId: user.id },
    });
    console.log("User receipt found:", userReceipt);

    if (!userReceipt) {
      return res
        .status(404)
        .json({ success: false, message: "unable to find user receipt!" });
    }

    return res.status(200).json({
      success: true,
      message: "User receipt retrieved successfully",
      data: userReceipt,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const SubscriptionExpiryEmail = async (email, expiryDate) => {
  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: email,
    subject: "Expired Subscription",
    html: `
      <div style="width: 100%; height:600px; max-width: 600px; margin: auto; text-align: center;
      font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
          <tr>
            <td style="background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') 
            no-repeat center center; background-size: cover;"></td>
          </tr>
        </table>
        <div style="padding: 20px; color:  #0B0F29;">
          <p style="font-size: 16px;">Dear valued customer, your subscription has expired at "${expiryDate}". To keep on enjoying our services, please subscribe again</p>
         
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};

async function scheduleUnsubscribeTimersForAllUsers() {
  try {
    // Find all users with a "Subscribed" status
    const users = await prisma.user.findMany({
      where: { subscription: "Subscribed" }, // Use enum value
      include: {
        receipt: {
          select: {
            created_at: true,
          },
        },
      },
    });

    const now = new Date();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    users.forEach((user) => {
      // Ensure you have the correct receipt date.
      // If receipt is an array, adjust accordingly (e.g., user.receipt[0].created_at).
      const subscriptionStart = new Date(user.receipt.created_at);
      const timeElapsed = now - subscriptionStart;
      const timeLeft = thirtyDaysInMs - timeElapsed;

      const futureDate = new Date(subscriptionStart);
      futureDate.setDate(subscriptionStart.getDate() + 30);
      console.log(futureDate.toISOString()); // Outputs: YYYY-MM-DDTHH:MM:SS.sssZ

      if (timeLeft <= 0) {
        // If the timer has already expired, unsubscribe immediately.
        (async () => {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscription: "Unsubscribed" },
            });

            await SubscriptionExpiryEmail(user.email, futureDate.toISOString());

            console.log(`User ${user.id} unsubscribed immediately.`);
          } catch (err) {
            console.error(`Error unsubscribing user ${user.id}:`, err);
          }
        })();
      } else {
        // Schedule a timer for the remaining time until unsubscription
        setTimeout(async () => {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscription: "Unsubscribed" },
            });
            console.log(`User ${user.id} unsubscribed after timer.`);
          } catch (error) {
            console.error(`Error unsubscribing user ${user.id}:`, error);
          }
        }, timeLeft);
        console.log(
          `Scheduled unsubscribe timer for user ${user.id} in ${timeLeft} ms.`
        );
      }
    });
  } catch (error) {
    console.error("Error scheduling unsubscribe timers:", error);
  }
}

// Use Node-Cron to run the scheduling function at a specific interval.
// In this example, the cron job runs every hour.
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled unsubscribe timers check...");
  scheduleUnsubscribeTimersForAllUsers();
});
