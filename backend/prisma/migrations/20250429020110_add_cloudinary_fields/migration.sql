/*
  Warnings:

  - You are about to drop the column `title` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "title",
ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "format" SET DEFAULT 'latex';
