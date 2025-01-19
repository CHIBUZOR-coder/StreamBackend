const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");

exports.createMovies = async (req, res) => {
  const {
    name,
    time,
    approxiT,
    popular,
    year,
    approxiY,
    rating,
    approxiR,
    language,
    description,
    price,
    trailer,
    categoryId,
  } = req.body;

  try {
    console.log("Request Body:", req.body);

    // Check if the movie already exists
    const existingMovie = await prisma.movies.findUnique({
      where: { name: name },
    });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: "Movie already exists",
        data: existingMovie,
      });
    }

    // Validate category
    const movieCategory = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
    });
    if (!movieCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    let imageUrl = null;
    let videoUrl = null;
    if (!req.files || !req.files.image || !req.files.video) {
      return res.status(400).json({ message: "Image or video file missing" });
    }
    console.log(req.files);

    try {
      // Upload image to Cloudinary
      imageUrl = await uploadToCloudinary(req.files.image[0].buffer, "image");
      console.log("Image URL after upload:", imageUrl);

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Unable to upload image",
        });
      }
      // Upload video to Cloudinary
      videoUrl = await uploadToCloudinary(req.files.video[0].buffer, "video");
      console.log("Video URL after upload:", videoUrl);

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "Unable to upload video",
        });
      }
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({
        success: false,
        message: `File upload failed: ${error.message}`,
      });
    }

    // Create movie entry
    const movie = await prisma.movies.create({
      data: {
        name,
        image: imageUrl,
        video: videoUrl,
        time,
        approxiT,
        popular: Boolean(popular),
        year,
        approxiY,
        rating: parseInt(rating),
        approxiR,
        language,
        description,
        price: parseFloat(price),
        trailer,
        categoryId: parseInt(movieCategory.id),
      },
    });

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Unable to create movie",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadToCloudinary = async (fileBuffer, resourceType) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourceType, folder: "Movie_Assets" },
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
