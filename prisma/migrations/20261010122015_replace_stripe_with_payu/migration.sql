/*
  Warnings:

  - You are about to drop the column `razorpayOrderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPaymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySignature` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payuTxnId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payuPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payuTxnId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_razorpayOrderId_key";

-- DropIndex
DROP INDEX "Payment_razorpayPaymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "razorpayOrderId",
DROP COLUMN "razorpayPaymentId",
DROP COLUMN "razorpaySignature",
ADD COLUMN     "payuPaymentId" TEXT,
ADD COLUMN     "payuTxnId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payuTxnId_key" ON "Payment"("payuTxnId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payuPaymentId_key" ON "Payment"("payuPaymentId");
