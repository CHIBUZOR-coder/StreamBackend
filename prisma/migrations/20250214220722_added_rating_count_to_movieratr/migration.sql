/*
  Warnings:

  - You are about to drop the column `ratingCount` on the `Movies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovieReviews" ADD COLUMN     "ratingCount" INTEGER;

-- AlterTable
ALTER TABLE "Movies" DROP COLUMN "ratingCount";
