-- CreateEnum
CREATE TYPE "Subscription" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscription" "Subscription" NOT NULL DEFAULT 'UNSUBSCRIBED';
