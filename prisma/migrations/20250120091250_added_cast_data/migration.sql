-- AlterTable
ALTER TABLE "Movies" ALTER COLUMN "popular" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Casts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_update_at" TIMESTAMP(3) NOT NULL,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "Casts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Casts" ADD CONSTRAINT "Casts_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
