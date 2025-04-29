/*
  Warnings:

  - You are about to drop the column `companyAddresses` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyCountry` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyDescription` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyEmployees` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyRating` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyRevenue` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `companyReviews` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `emails` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `experienceRange` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `jobFunction` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `jobLevel` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `salarySource` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `vacancyCount` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `workFromHomeType` on the `JobPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobPost" DROP CONSTRAINT "JobPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropIndex
DROP INDEX "Resume_userId_idx";

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "companyAddresses",
DROP COLUMN "companyCountry",
DROP COLUMN "companyDescription",
DROP COLUMN "companyEmployees",
DROP COLUMN "companyRating",
DROP COLUMN "companyRevenue",
DROP COLUMN "companyReviews",
DROP COLUMN "emails",
DROP COLUMN "experienceRange",
DROP COLUMN "jobFunction",
DROP COLUMN "jobLevel",
DROP COLUMN "salarySource",
DROP COLUMN "skills",
DROP COLUMN "vacancyCount",
DROP COLUMN "workFromHomeType",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "jobType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
