/*
  Warnings:

  - You are about to drop the column `movieId` on the `Casts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Casts" DROP CONSTRAINT "Casts_movieId_fkey";

-- AlterTable
ALTER TABLE "Casts" DROP COLUMN "movieId";

-- CreateTable
CREATE TABLE "CastsOnMovies" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "castId" INTEGER NOT NULL,

    CONSTRAINT "CastsOnMovies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CastsOnMovies_movieId_castId_key" ON "CastsOnMovies"("movieId", "castId");

-- AddForeignKey
ALTER TABLE "CastsOnMovies" ADD CONSTRAINT "CastsOnMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastsOnMovies" ADD CONSTRAINT "CastsOnMovies_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Casts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
