/*
  Warnings:

  - The `userRating` column on the `MovieReviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MovieReviews" DROP COLUMN "userRating",
ADD COLUMN     "userRating" INTEGER;
