/*
  Warnings:

  - A unique constraint covering the columns `[fileHash]` on the table `XRay` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."XRay" ADD COLUMN     "fileHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "XRay_fileHash_key" ON "public"."XRay"("fileHash");
