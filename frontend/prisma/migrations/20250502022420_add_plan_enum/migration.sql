/*
  Warnings:

  - The `plan` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';
