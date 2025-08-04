-- CreateTable
CREATE TABLE "Trending" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "video" TEXT,
    "time" TEXT NOT NULL,
    "approxiT" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL,
    "categoryId" INTEGER NOT NULL DEFAULT 0,
    "year" TEXT NOT NULL,
    "approxiY" TEXT NOT NULL,
    "rating" INTEGER,
    "watchCount" INTEGER NOT NULL DEFAULT 0,
    "approxiR" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "trailer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trending_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovieReviews" ADD CONSTRAINT "MovieReviews_trendingId_fkey" FOREIGN KEY ("trendingId") REFERENCES "Trending"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastsOnMovies" ADD CONSTRAINT "CastsOnMovies_trendingId_fkey" FOREIGN KEY ("trendingId") REFERENCES "Trending"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trending" ADD CONSTRAINT "Trending_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCartMovies" ADD CONSTRAINT "FavouriteCartMovies_trendingId_fkey" FOREIGN KEY ("trendingId") REFERENCES "Trending"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchCartMovies" ADD CONSTRAINT "WatchCartMovies_trendingId_fkey" FOREIGN KEY ("trendingId") REFERENCES "Trending"("id") ON DELETE SET NULL ON UPDATE CASCADE;
