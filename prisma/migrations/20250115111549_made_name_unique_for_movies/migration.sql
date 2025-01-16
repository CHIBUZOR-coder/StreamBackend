/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movies_name_key" ON "Movies"("name");
