/*
  Warnings:

  - You are about to drop the column `brandId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `buyingPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `datasheetUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[itemCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemCode` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropIndex
DROP INDEX "public"."Product_sku_key";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "brandId",
DROP COLUMN "buyingPrice",
DROP COLUMN "datasheetUrl",
DROP COLUMN "sku",
ADD COLUMN     "itemCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Brand";

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemCode_key" ON "public"."Product"("itemCode");
