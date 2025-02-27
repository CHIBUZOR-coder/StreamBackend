-- DropForeignKey
ALTER TABLE "FavouriteCartMovies" DROP CONSTRAINT "FavouriteCartMovies_favouriteCartId_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteCartMovies" DROP CONSTRAINT "FavouriteCartMovies_movieId_fkey";

-- DropForeignKey
ALTER TABLE "WatchCartMovies" DROP CONSTRAINT "WatchCartMovies_movieId_fkey";

-- DropForeignKey
ALTER TABLE "WatchCartMovies" DROP CONSTRAINT "WatchCartMovies_watchCartId_fkey";

-- AddForeignKey
ALTER TABLE "FavouriteCartMovies" ADD CONSTRAINT "FavouriteCartMovies_favouriteCartId_fkey" FOREIGN KEY ("favouriteCartId") REFERENCES "FavouriteCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCartMovies" ADD CONSTRAINT "FavouriteCartMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchCartMovies" ADD CONSTRAINT "WatchCartMovies_watchCartId_fkey" FOREIGN KEY ("watchCartId") REFERENCES "WatchCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchCartMovies" ADD CONSTRAINT "WatchCartMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
