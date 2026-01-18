/*
  Warnings:

  - You are about to drop the column `description` on the `release` table. All the data in the column will be lost.
  - You are about to drop the column `docs` on the `release` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `release` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `release` table. All the data in the column will be lost.
  - Added the required column `hash` to the `release` table without a default value. This is not possible if the table is not empty.
  - Added the required column `release` to the `release` table without a default value. This is not possible if the table is not empty.
  - Added the required column `root_file` to the `release` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `release` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zig_version` to the `release` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "release_name_key";

-- AlterTable
ALTER TABLE "release" DROP COLUMN "description",
DROP COLUMN "docs",
DROP COLUMN "name",
DROP COLUMN "tags",
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "release" TEXT NOT NULL,
ADD COLUMN     "root_file" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "zig_version" TEXT NOT NULL;
