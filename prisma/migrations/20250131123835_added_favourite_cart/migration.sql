-- CreateTable
CREATE TABLE "FavouriteCart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FavouriteCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteCartMovies" (
    "favouriteCartId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteCart_userId_key" ON "FavouriteCart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteCartMovies_favouriteCartId_movieId_key" ON "FavouriteCartMovies"("favouriteCartId", "movieId");

-- AddForeignKey
ALTER TABLE "FavouriteCart" ADD CONSTRAINT "FavouriteCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCartMovies" ADD CONSTRAINT "FavouriteCartMovies_favouriteCartId_fkey" FOREIGN KEY ("favouriteCartId") REFERENCES "FavouriteCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCartMovies" ADD CONSTRAINT "FavouriteCartMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
