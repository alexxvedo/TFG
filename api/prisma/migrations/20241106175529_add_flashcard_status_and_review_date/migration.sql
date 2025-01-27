/*
  Warnings:

  - You are about to drop the column `hechas` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `porRevisar` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `sinHacer` on the `Collection` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlashcardStatus" AS ENUM ('SIN_HACER', 'COMPLETADA');

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "hechas",
DROP COLUMN "porRevisar",
DROP COLUMN "sinHacer";

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "status" "FlashcardStatus" NOT NULL DEFAULT 'SIN_HACER';

-- CreateTable
CREATE TABLE "FlashcardActivity" (
    "id" SERIAL NOT NULL,
    "flashcardId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "result" "FlashcardStatus" NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashcardActivity_flashcardId_userId_idx" ON "FlashcardActivity"("flashcardId", "userId");

-- AddForeignKey
ALTER TABLE "FlashcardActivity" ADD CONSTRAINT "FlashcardActivity_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
