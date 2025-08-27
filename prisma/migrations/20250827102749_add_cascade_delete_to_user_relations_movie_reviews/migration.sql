-- DropForeignKey
ALTER TABLE "MovieReviews" DROP CONSTRAINT "MovieReviews_userId_fkey";

-- AddForeignKey
ALTER TABLE "MovieReviews" ADD CONSTRAINT "MovieReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
