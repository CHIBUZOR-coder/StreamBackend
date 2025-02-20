/*
  Warnings:

  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Verification" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verified",
ADD COLUMN     "status" "Verification" NOT NULL DEFAULT 'UNVERIFIED';

-- DropEnum
DROP TYPE "Verified";
