/*
  Warnings:

  - The primary key for the `WorkspaceUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "WorkspaceUser" DROP CONSTRAINT "WorkspaceUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WorkspaceUser_id_seq";
