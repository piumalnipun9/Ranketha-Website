/*
  Warnings:

  - You are about to drop the `PhoneNumber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PhoneNumber" DROP CONSTRAINT "PhoneNumber_userId_fkey";

-- DropTable
DROP TABLE "public"."PhoneNumber";
