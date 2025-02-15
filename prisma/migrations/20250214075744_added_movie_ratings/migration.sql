-- CreateTable
CREATE TABLE "MovieRatings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "userRating" TEXT,

    CONSTRAINT "MovieRatings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieRatings_userId_movieId_key" ON "MovieRatings"("userId", "movieId");

-- AddForeignKey
ALTER TABLE "MovieRatings" ADD CONSTRAINT "MovieRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRatings" ADD CONSTRAINT "MovieRatings_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
