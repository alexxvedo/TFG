/*
  Warnings:

  - The primary key for the `Friendship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkspaceUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,workspaceId]` on the table `WorkspaceUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Friendship_userId2_userId1_key";

-- AlterTable
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WorkspaceUser" DROP CONSTRAINT "WorkspaceUser_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUser_userId_workspaceId_key" ON "WorkspaceUser"("userId", "workspaceId");
