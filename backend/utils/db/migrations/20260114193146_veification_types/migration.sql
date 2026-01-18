/*
  Warnings:

  - Added the required column `type` to the `verify` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "verification_type" AS ENUM ('email', 'password');

-- AlterTable
ALTER TABLE "verify" ADD COLUMN     "type" "verification_type" NOT NULL;
