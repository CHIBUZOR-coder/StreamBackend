/*
  Warnings:

  - You are about to drop the `MovieRatings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MovieRatings" DROP CONSTRAINT "MovieRatings_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MovieRatings" DROP CONSTRAINT "MovieRatings_userId_fkey";

-- DropTable
DROP TABLE "MovieRatings";

-- CreateTable
CREATE TABLE "MovieReviews" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "userRating" TEXT,

    CONSTRAINT "MovieReviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieReviews_userId_movieId_key" ON "MovieReviews"("userId", "movieId");

-- AddForeignKey
ALTER TABLE "MovieReviews" ADD CONSTRAINT "MovieReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieReviews" ADD CONSTRAINT "MovieReviews_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
