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

    if (
      !name ||
      !time ||
      !year ||
      !rating ||
      !language ||
      !description ||
      !price ||
      !trailer ||
      !categoryId
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

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
    // if (!req.files || !req.files.image || !req.files.video) {
    //   return res.status(400).json({ message: "Image or video file missing" });
    // }
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
      if (req.files.video) {
        videoUrl = await uploadToCloudinary(req.files.video[0].buffer, "video");
        console.log("Video URL after upload:", videoUrl);

        if (!videoUrl) {
          return res.status(400).json({
            success: false,
            message: "Unable to upload video",
          });
        }
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

//Get Movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await prisma.movies.findMany({
      include: {
        casts: {
          include: {
            cast: true, // This ensures you get the full Cast details
          },
        },
        category: true,
      },
    });

    if (!movies) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch movies" });
    }

    res.status(200);

    return res.json({
      success: true,
      message: "Movies retrived successfully",
      data: movies,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

//Update
exports.UpdateMovie = async (req, res) => {
  const { name, movieId } = req.body;
  console.log(req.body);

  try {
    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(movieId) },
    });
    if (!movie) {
      return res
        .status(400)
        .json({ success: false, message: "Movie does not exist" });
    }

    const updatedMovies = await prisma.movies.update({
      where: { id: parseInt(movieId) },
      data: { name },
    });

    if (!updatedMovies) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update movie" });
    }

    return res.status(201).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovies,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

//Delete Movie
exports.deleteAllMovie = async (req, res) => {
  try {
    const deletedMovies = await prisma.movies.deleteMany();
    if (deletedMovies.count === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found to delete.",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Movies Deleted successfully" });
  } catch (error) {
    console.error("Error deleting movies:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting movies.",
    });
  }
};

//Delete Single
exports.deleteSingle = async (req, res) => {
  const { id } = req.body;

  try {
    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res
        .status(400)
        .json({ success: false, message: "Movie does not exist" });
    }

    const deleted = await prisma.movies.delete({ where: { id: parseInt(id) } });
    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to delete Movie" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ success: false, message: "Unable to delete Movie" });
  }
};
