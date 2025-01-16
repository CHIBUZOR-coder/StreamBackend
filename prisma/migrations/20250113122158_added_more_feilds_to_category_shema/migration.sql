/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Category` table. All the data in the column will be lost.
  - Added the required column `tittle` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_update_at` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description",
DROP COLUMN "image",
ADD COLUMN     "display" TEXT NOT NULL DEFAULT 'show',
ADD COLUMN     "tittle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "product_update_at" TIMESTAMP(3) NOT NULL;
