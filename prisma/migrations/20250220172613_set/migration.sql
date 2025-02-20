/*
  Warnings:

  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - The `resetToken` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
DROP COLUMN "resetToken",
ADD COLUMN     "resetToken" BOOLEAN NOT NULL DEFAULT false;
