-- -- CreateEnum
-- CREATE TYPE "public"."Role" AS ENUM ('doc', 'staff');

-- -- CreateTable
-- CREATE TABLE "public"."users" (
--     "id" SERIAL NOT NULL,
--     "username" TEXT NOT NULL,
--     "password" TEXT NOT NULL,
--     "role" "public"."Role" NOT NULL DEFAULT 'staff',

--     CONSTRAINT "users_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "public"."Patient" (
--     "id" SERIAL NOT NULL,
--     "patientId" TEXT NOT NULL,
--     "name" TEXT NOT NULL,
--     "age" INTEGER NOT NULL,
--     "gender" TEXT NOT NULL,
--     "phone" TEXT,
--     "address" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "public"."XRay" (
--     "id" SERIAL NOT NULL,
--     "xrayId" TEXT NOT NULL,
--     "filePath" TEXT NOT NULL,
--     "analyzedPath" TEXT,
--     "patientId" INTEGER NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "XRay_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "Patient_patientId_key" ON "public"."Patient"("patientId");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "XRay_xrayId_key" ON "public"."XRay"("xrayId");

-- -- AddForeignKey
-- ALTER TABLE "public"."XRay" ADD CONSTRAINT "XRay_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
