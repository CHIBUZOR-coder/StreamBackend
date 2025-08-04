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
      !language ||
      !description ||
      !price ||
      !trailer
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "category id is required",
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



//Add Trending movies
// exports.AddTrendingMovies = async (req, res) => {
//   try {
//     const { id } = req.body;

//     console.log("req.body:", req.body);
    

//     // 1. Find the movie from the movies table
//     const existingMovie = await prisma.movies.findUnique({ where: { id } });

//     if (!existingMovie) {
//       return res.status(400).json({
//         success: false,
//         message: "Movie not found in movies database",
//       });
//     }




//     // 2. Extract only the necessary fields for trending table
//     const { 
      
//       name,
//         image,
//         videoUrl,
//         time,
//         approxiT,
//         popular,
//         year,
//         approxiY,
//         rating,
//         approxiR,
//         language,
//         description,
//         price,
//         trailer,
//         categoryId 
//       } = existingMovie;


//           // Optional: Check if it's already trending
// const isAlreadyTrending = await prisma.trending.findFirst({
//   where: { name } // or `movieId` if you’re tracking source
// });

// if (isAlreadyTrending) {
//   const updatedTrending = await prisma.trending.update({
//     where: { id: isAlreadyTrending.id },
//     data: {
//       count: {
//         increment: 1,
//       },
//     },
//   });

//    return res.status(201).json({success:true, message:"movie trending count incremented successfully !"})
//   }


//    // 3. Create new trending movie
//     const newTrendingMovie = await prisma.trending.create({
//       data: {
//         name,
//         image,
//         videoUrl,
//         time,
//         approxiT,
//         popular,
//         year,
//         approxiY,
//         rating,
//         approxiR,
//         language,
//         description,
//         count:1,
//         price,
//         trailer,
//         categoryId
//       },
//     });

//     // 4. Send success response
//     res.status(201).json({
//       success: true,
//       message: "Movie added to trending list",
//       data: newTrendingMovie,
//     });

// }catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

exports.AddTrendingMovies = async (req, res) => {
  try {
    const { id } = req.body;

    console.log("req.body:", req.body);

    // 1. Find the movie from the movies table
    const existingMovie = await prisma.movies.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      return res.status(400).json({
        success: false,
        message: "Movie not found in movies database",
      });
    }

    // 2. Extract only the necessary fields for trending table
    const {
      name,
      image,
      videoUrl,
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
    } = existingMovie;

    // Optional: Check if it's already trending
    const isAlreadyTrending = await prisma.trending.findFirst({
      where: { name }, // or use `movieId: id` if applicable
    });

    if (isAlreadyTrending) {
      const updatedTrending = await prisma.trending.update({
        where: { id: isAlreadyTrending.id },
        data: {
          count: {
            increment: 1,
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Movie trending count incremented successfully!",
      });
    }

    // 3. Create new trending movie
    const newTrendingMovie = await prisma.trending.create({
      data: {
        movieId: id, // use the original id here
        name,
        image,
        videoUrl,
        time,
        approxiT,
        popular,
        year,
        approxiY,
        rating,
        approxiR,
        language,
        description,
        count: 1,
        price,
        trailer,
        categoryId,
      },
    });

    // 4. Send success response
    res.status(201).json({
      success: true,
      message: "Movie added to trending list",
      data: newTrendingMovie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getTrending = async (req, res) => {
  try {
    const Trending = await prisma.trending.findMany({
      orderBy: {
        count: 'desc',
      },
    });

    if (!Trending || Trending.length === 0) {
      return res.status(404).json({ success: false, message: "No Trending Movies Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Trending movies found successfully!",
      data: Trending,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error while fetching trending movies" });
  }
};













//Get Movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await prisma.movies.findMany({
      include: {
        casts: {
          select: {
            role: true,
            cast: {
              select: {
                role: true,
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        category: { select: { tittle: true } },
        movieReviews: {
          select: {
            userRating: true,
            userReview: true,
            user: { select: { name: true, image: true } },
          },
        },
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






//Get single movie
exports.getSingleMovie = async(req, res)=>{
const {id} = req.body
console.log("reqbody:",req.body);

try {
  const movie = await prisma.movies.findUnique({where:{id: parseInt(id)}})
  if(!movie){
    return res.status(404).json({success:false, message:"Movie not found!"})
  }
console.log("movie:", movie);

  return res.status(200).json({success:true, message:"Movie retrived successfully!", data:movie, id : movie?.id})
} catch (error) {
  console.log("error:", error.message);
  return res.status(500).json({success:false, message:"Server error! Please try ahgain later"})
  
}
}





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
// Delete Single Movie
exports.deleteSingle = async (req, res) => {
  const { id } = req.body;

  try {
    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(id) },
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie does not exist",
      });
    }

    // Find associated cast entries
    const castOnMovies = await prisma.castsOnMovies.findMany({
      where: { movieId: parseInt(id) },
    });

    // Delete associated cast entries first
    if (castOnMovies.length > 0) {
      await prisma.castsOnMovies.deleteMany({
        where: { movieId: parseInt(id) },
      });
    }

    // Now delete the movie
    await prisma.movies.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.MovieReviews = async (req, res) => {
  const { userId, movieId, userRating, userReview } = req.body;
  const parsedRating = parseInt(userRating);

  console.log("req.body:", req.body);

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }

    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(movieId) },
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found!",
      });
    }

    const existingReview = await prisma.movieReviews.findFirst({
      where: { userId: parseInt(userId), movieId: parseInt(movieId) },
    });

    let updatedreview;
    let newRevew;
    if (!existingReview) {
      newRevew = await prisma.movieReviews.create({
        data: {
          userId: parseInt(userId),
          movieId: parseInt(movieId),
          userRating: parsedRating,
          userReview,
        },
      });
    } else {
      updatedreview = await prisma.movieReviews.update({
        where: {
          user_movie_unique: {
            userId: parseInt(userId),
            movieId: parseInt(movieId),
          },
        },
        data: { userRating: parsedRating, userReview },
      });
    }

    let rating;
    const movieToRate = await prisma.movies.findUnique({
      where: { id: parseInt(movieId) },
      select: {
        movieReviews: {
          select: {
            userRating: true,
          },
        },
      },
    });

    if (movieToRate && movieToRate.movieReviews.length > 0) {
      const totalRate = movieToRate.movieReviews.reduce((acc, curr) => {
        return acc + Number(curr.userRating);
      }, 0);

      rating = totalRate / movieToRate.movieReviews.length;

      await prisma.movies.update({
        where: { id: parseInt(movieId) },
        data: { rating },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review and rating updated successfully!",
      data: updatedreview || newRevew,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the review.",
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    // let avrageReview;
    const allReview = await prisma.movieReviews.findMany({
      select: {
        movie: { select: { name: true } },
        userRating: true,
        userReview: true,
        user: { select: { name: true, image: true, id: true, email: true } },
      },
    });
    if (allReview.length < 1) {
      return res
        .status(404)
        .json({ success: false, message: "Reviews not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Reviews retrived successfully",
      data: allReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false, message: error.message });
  }
};
