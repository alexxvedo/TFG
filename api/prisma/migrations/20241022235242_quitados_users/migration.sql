/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId1_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId2_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceUser" DROP CONSTRAINT "WorkspaceUser_userId_fkey";

-- AlterTable
ALTER TABLE "Friendship" ALTER COLUMN "userId1" SET DATA TYPE TEXT,
ALTER COLUMN "userId2" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "WorkspaceUser" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "users";
