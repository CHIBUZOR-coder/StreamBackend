const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addToFavouriteCart = async (req, res) => {
  const { movieId, Id } = req.body;
  // console.log("movieId:", movieId);

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
    const { id } = req.params;

    // console.log("userId:", id);

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

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
