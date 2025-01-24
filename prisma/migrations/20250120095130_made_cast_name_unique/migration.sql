/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Casts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Casts_name_key" ON "Casts"("name");
