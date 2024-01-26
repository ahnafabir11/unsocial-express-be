/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Follow` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followerId,followingId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
