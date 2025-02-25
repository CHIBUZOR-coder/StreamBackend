-- CreateTable
CREATE TABLE "WatchCart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WatchCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchCartMovies" (
    "watchCartId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchCart_userId_key" ON "WatchCart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchCartMovies_watchCartId_movieId_key" ON "WatchCartMovies"("watchCartId", "movieId");

-- AddForeignKey
ALTER TABLE "WatchCart" ADD CONSTRAINT "WatchCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchCartMovies" ADD CONSTRAINT "WatchCartMovies_watchCartId_fkey" FOREIGN KEY ("watchCartId") REFERENCES "WatchCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchCartMovies" ADD CONSTRAINT "WatchCartMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
