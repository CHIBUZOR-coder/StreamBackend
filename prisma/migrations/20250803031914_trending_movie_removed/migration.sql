/*
  Warnings:

  - You are about to drop the `Trending` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CastsOnMovies" DROP CONSTRAINT "CastsOnMovies_trendingId_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteCartMovies" DROP CONSTRAINT "FavouriteCartMovies_trendingId_fkey";

-- DropForeignKey
ALTER TABLE "MovieReviews" DROP CONSTRAINT "MovieReviews_trendingId_fkey";

-- DropForeignKey
ALTER TABLE "Trending" DROP CONSTRAINT "Trending_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "WatchCartMovies" DROP CONSTRAINT "WatchCartMovies_trendingId_fkey";

-- DropTable
DROP TABLE "Trending";
