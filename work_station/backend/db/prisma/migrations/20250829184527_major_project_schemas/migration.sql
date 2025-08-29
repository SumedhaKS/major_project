/*
  Warnings:

  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hashed_password` on the `users` table. All the data in the column will be lost.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('doc', 'staff');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "created_at",
DROP COLUMN "hashed_password",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'staff',
ALTER COLUMN "username" SET DATA TYPE TEXT;
