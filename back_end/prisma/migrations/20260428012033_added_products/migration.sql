/*
  Warnings:

  - You are about to drop the column `products` on the `JobResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobResult" DROP COLUMN "products";

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "productDomainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobResultToProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobResultToProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JobResultToProducts_B_index" ON "_JobResultToProducts"("B");

-- AddForeignKey
ALTER TABLE "_JobResultToProducts" ADD CONSTRAINT "_JobResultToProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "JobResult"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobResultToProducts" ADD CONSTRAINT "_JobResultToProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
