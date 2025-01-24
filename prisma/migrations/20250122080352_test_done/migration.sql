-- CreateTable
CREATE TABLE "Casts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Casts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastsOnMovies" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "castId" INTEGER NOT NULL,

    CONSTRAINT "CastsOnMovies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Casts_name_key" ON "Casts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CastsOnMovies_movieId_castId_key" ON "CastsOnMovies"("movieId", "castId");

-- AddForeignKey
ALTER TABLE "CastsOnMovies" ADD CONSTRAINT "CastsOnMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastsOnMovies" ADD CONSTRAINT "CastsOnMovies_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Casts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
