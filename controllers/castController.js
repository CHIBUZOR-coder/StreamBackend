const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../config/cloudinary");

exports.AddCast = async (req, res) => {
  const { movieId } = req.body;
  const casts = JSON.parse(req.body.casts); // Parse casts array if sent as a stringified JSON

  if (!Array.isArray(casts) || casts.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Casts should be a non-empty array.",
    });
  }

  try {
    let Existing;
    let ExistingAndAssociated;
    let Done;
    
    //find  movie
    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(movieId) },
    });

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "No Movie matches this cast.",
      });
    }

    const addedCasts = [];
    let newCastCreated = false;

    // Loop over all casts and process them
    for (const [index, cast] of casts.entries()) {
      const { name, role } = cast;
      const imageFile = req.files.find(
        (file) => file.fieldname === `casts[${index}][imageurl]`
      );

      if (!name || !role || !imageFile) {
        return res.status(400).json({
          success: false,
          message: `Invalid data for cast. Ensure 'name', 'role', and 'image file' are provided.`,
        });
      }

      // Check if the cast already exists
      const existingCast = await prisma.casts.findFirst({ where: { name } });
      let castId;
      let imageUrl;

      if (existingCast) {
        castId = existingCast.id;
        Existing = true;
        // Check if the cast is already associated with the movie
        const existingAssociation = await prisma.castsOnMovies.findFirst({
          where: { castId, movieId: movie.id },
        });

        if (existingAssociation) {
          ExistingAndAssociated = true;
          Done = true;
          // Cast already associated with movie, skip image upload and association
          addedCasts.push({
            name,
            role,
            image: existingCast.image, // Use existing image URL
            message: `Cast '${name}' is already associated with this movie, no new image uploaded.`,
          });
          continue; // Skip the rest of the loop and move to the next cast
        }
      } else {
        // If it's a new cast, upload the image to Cloudinary
        imageUrl = await uploadToCloudinary(imageFile.buffer, "image");
        const newCast = await prisma.casts.create({
          data: { name, role, image: imageUrl },
        });
        castId = newCast.id;
        newCastCreated = true;
      }

      // Create the cast association between the cast and the movie
      await prisma.castsOnMovies.create({
        data: { castId, movieId: movie.id },
      });

      // Add the cast details to the response array
      addedCasts.push({
        name,
        role,
        image: imageUrl || existingCast.image, // Use new image URL or existing image
      });
    }

    // Send response after all casts have been processed
    if (addedCasts.length > 0) {
      if (Existing === true && Done !== true) {
        return res.status(200).json({
          success: true,
          message: `All ${addedCasts.length} casts were already existing and have now been added .`,
          data: addedCasts,
        });
      } else if (
        Existing === true &&
        ExistingAndAssociated === true &&
        Done === true
      ) {
        return res.status(200).json({
          success: true,
          message: `All ${addedCasts.length} casts were already existing and already associated with the movie .`,
          data: addedCasts,
        });
      } else if (newCastCreated) {
        return res.status(201).json({
          success: true,
          message: "Casts processed successfully.",
          data: addedCasts,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "No casts were added.",
      });
    }
  } catch (error) {
    console.error("AddCast Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding casts.",
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
