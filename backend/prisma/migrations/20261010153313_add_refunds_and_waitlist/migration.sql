/*
  Warnings:

  - You are about to drop the column `processedAt` on the `Refund` table. All the data in the column will be lost.
  - You are about to drop the column `registrationId` on the `Refund` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Refund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the column `claimedAt` on the `WaitlistEntry` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `WaitlistEntry` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `WaitlistEntry` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payuRefundId]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WaitlistEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'PROMOTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "WaitlistEntry" DROP CONSTRAINT "WaitlistEntry_eventId_fkey";

-- DropForeignKey
ALTER TABLE "WaitlistEntry" DROP CONSTRAINT "WaitlistEntry_userId_fkey";

-- DropIndex
DROP INDEX "Refund_registrationId_key";

-- DropIndex
DROP INDEX "WaitlistEntry_eventId_position_key";

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "processedAt",
DROP COLUMN "registrationId",
ADD COLUMN     "idempotencyKey" TEXT NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "payuRefundId" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "WaitlistEntry" DROP COLUMN "claimedAt",
DROP COLUMN "expiresAt",
DROP COLUMN "position",
ADD COLUMN     "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_payuRefundId_key" ON "Refund"("payuRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Refund_paymentId_status_idx" ON "Refund"("paymentId", "status");

-- CreateIndex
CREATE INDEX "WaitlistEntry_eventId_status_createdAt_idx" ON "WaitlistEntry"("eventId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
