/*
  Warnings:

  - You are about to drop the `Casts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CastsOnMovies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CastsOnMovies" DROP CONSTRAINT "CastsOnMovies_castId_fkey";

-- DropForeignKey
ALTER TABLE "CastsOnMovies" DROP CONSTRAINT "CastsOnMovies_movieId_fkey";

-- DropTable
DROP TABLE "Casts";

-- DropTable
DROP TABLE "CastsOnMovies";
