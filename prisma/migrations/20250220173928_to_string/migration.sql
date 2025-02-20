-- AlterTable
ALTER TABLE "User" ALTER COLUMN "resetToken" SET DEFAULT 'false',
ALTER COLUMN "resetToken" SET DATA TYPE TEXT;
