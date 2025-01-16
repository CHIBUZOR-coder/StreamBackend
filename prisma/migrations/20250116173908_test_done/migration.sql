-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "tittle" TEXT NOT NULL,
    "display" TEXT NOT NULL DEFAULT 'show',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_tittle_key" ON "Category"("tittle");

-- AddForeignKey
ALTER TABLE "Movies" ADD CONSTRAINT "Movies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
