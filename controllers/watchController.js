const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addToWatchCount = async (req, res) => {
  const { movieId, Id } = req.body;
  console.log("movieId:", movieId);

  try {
    //find the cart
    let watchCart = await prisma.watchCart.findUnique({
      where: { userId: Id },
    });
    // console.log("User ID:", Id);
    //create a new one if the cart was not found
    if (!watchCart) {
      watchCart = await prisma.watchCart.create({
        data: { userId: parseInt(Id) },
      });
    }

    //find the movie
    const movie = await prisma.movies.findUnique({
      where: { id: parseInt(movieId) },
      include: {
        category: true,
      },
    });

    if (!movie) {
      return res
        .status(400)
        .json({ success: false, message: "Movie does not exist" });
    }

    //favouriteCartMovie is a singular movie that is to be added to cart
    let watchCartMovie = await prisma.watchCartMovies.findFirst({
      where: { watchCartId: watchCart.id, movieId: movie.id },
    });
    if (watchCartMovie) {
      return res.status(400).json({
        success: false,
        message: "the movies you want to add to watch count already exist",
      });
    } else {
      watchCartMovie = await prisma.watchCartMovies.create({
        data: { watchCartId: watchCart.id, movieId: movie.id },
      });
    }
    return res.status(200).json({
      success: true,
      message: "This movie have successfully been added to your watch history ",
      data: movie,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getWatchCount = async (req, res) => {
  try {
    // console.log("userId:", id);
    const { name } = req.query;

    const user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const watchCart = await prisma.watchCart.findUnique({
      where: { userId: user.id },
      include: {
        watchCartMovies: {
          select: {
            movie: {
              include: {
                category: {
                  select: {
                    tittle: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!watchCart) {
      return res
        .status(404)
        .json({ success: false, message: "Unable to find user cart!" });
    }

    return res.status(200).json({
      success: true,
      message: "Watched movies cart retrived succeessfully",
      data: watchCart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeWatchCount = async (req, res) => {
  try {
    const { name } = req.params; // User's name
    const { movieId } = req.body; // Movie ID to remove

    // Find the user by name
    const user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the user's favourite cart
    const watchCart = await prisma.watchCart.findUnique({
      where: { userId: user.id },
    });

    if (!watchCart) {
      return res
        .status(404)
        .json({ success: false, message: "Favourite cart not found" });
    }

    // Delete the movie from the favourite cart
    const deletedMovie = await prisma.watchCartMovies.deleteMany({
      where: {
        watchCartId: watchCart.id,
        movieId: parseInt(movieId),
      },
    });

    if (deletedMovie.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in favourite cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie removed from favourite cart successfully",
    });
  } catch (error) {
    console.error("Error removing movie from favourite cart:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing the movie",
    });
  }
};
