/*
  Warnings:

  - You are about to drop the column `phone` on the `Movies` table. All the data in the column will be lost.
  - Added the required column `approxiR` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movies" DROP COLUMN "phone",
ADD COLUMN     "approxiR" TEXT NOT NULL;
