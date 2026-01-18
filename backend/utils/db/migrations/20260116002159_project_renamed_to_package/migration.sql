/*
  Warnings:

  - You are about to drop the column `projectId` on the `release` table. All the data in the column will be lost.
  - You are about to drop the `project` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `packageId` to the `release` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_userId_fkey";

-- DropForeignKey
ALTER TABLE "release" DROP CONSTRAINT "release_projectId_fkey";

-- AlterTable
ALTER TABLE "release" DROP COLUMN "projectId",
ADD COLUMN     "packageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "verify" ALTER COLUMN "type" SET DEFAULT 'email';

-- DropTable
DROP TABLE "project";

-- CreateTable
CREATE TABLE "package" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "docs" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_name_key" ON "package"("name");

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
