-- CreateTable
CREATE TABLE "Movies" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "confirm" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "approxiT" TEXT NOT NULL,
    "video" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL,
    "approxiY" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "trailer" TEXT NOT NULL,

    CONSTRAINT "Movies_pkey" PRIMARY KEY ("id")
);
