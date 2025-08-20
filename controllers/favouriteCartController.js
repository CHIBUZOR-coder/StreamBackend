const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addToFavouriteCart = async (req, res) => {
  const { movieId, Id } = req.body;
  console.log("movieId:", movieId);

  try {
    //find the cart
    let favouriteCart = await prisma.favouriteCart.findUnique({
      where: { userId: Id },
    });
    // console.log("User ID:", Id);
    //create a new one if the cart was not found
    if (!favouriteCart) {
      favouriteCart = await prisma.favouriteCart.create({
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
    let favouriteCartMovie = await prisma.favouriteCartMovies.findFirst({
      where: { favouriteCartId: favouriteCart.id, movieId: movie.id },
    });
    if (favouriteCartMovie) {
      return res.status(400).json({
        success: false,
        message: "the movies you want to add to favourite already exist",
      });
    } else {
      favouriteCartMovie = await prisma.favouriteCartMovies.create({
        data: { favouriteCartId: favouriteCart.id, movieId: movie.id },
      });
    }
    return res.status(200).json({
      success: true,
      message: "Movie added to cart successfully",
      data: movie,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFavourite = async (req, res) => {
  try {
    const name = req.params.name || req.body.name;
    console.log("Nname:", name);

    // console.log("userId:", id);

    const user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const favouriteCart = await prisma.favouriteCart.findUnique({
      where: { userId: user.id },
      include: {
        favouriteCartMovies: {
          include: {
            movie: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!favouriteCart) {
      return res
        .status(404)
        .json({ success: false, message: "Unable to find user cart!" });
    }

    res.status(200);

    return res.json({
      success: true,
      message: "Favourite cart retrived succeessfully",
      data: favouriteCart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavouriteMovie = async (req, res) => {
  try {
    const { name } = req.params; // User's name
    const { movieId } = req.body; // Movie ID to remove
    console.log("Received params:", req.params);
    console.log("body:", req.body);

    // Find the user by name
    const user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the user's favourite cart
    const favouriteCart = await prisma.favouriteCart.findUnique({
      where: { userId: user.id },
    });

    if (!favouriteCart) {
      return res
        .status(404)
        .json({ success: false, message: "Favourite cart not found" });
    }

    // Delete the movie from the favourite cart
    const deletedMovie = await prisma.favouriteCartMovies.deleteMany({
      where: {
        favouriteCartId: favouriteCart.id,
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
