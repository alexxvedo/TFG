/*
  Warnings:

  - You are about to drop the column `userId` on the `FlashcardActivity` table. All the data in the column will be lost.
  - Added the required column `studySessionId` to the `FlashcardActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FlashcardActivity_flashcardId_userId_idx";

-- AlterTable
ALTER TABLE "FlashcardActivity" DROP COLUMN "userId",
ADD COLUMN     "studySessionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "StudySession" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashcardActivity_flashcardId_studySessionId_idx" ON "FlashcardActivity"("flashcardId", "studySessionId");
