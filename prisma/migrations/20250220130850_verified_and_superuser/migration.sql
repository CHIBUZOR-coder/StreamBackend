/*
  Warnings:

  - You are about to drop the column `is_Verified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Verified" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERUSER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_Verified",
ADD COLUMN     "verified" "Verified" NOT NULL DEFAULT 'UNVERIFIED';
