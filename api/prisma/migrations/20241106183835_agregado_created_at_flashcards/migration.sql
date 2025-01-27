/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FlashcardActivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FlashcardActivity" DROP COLUMN "createdAt";
