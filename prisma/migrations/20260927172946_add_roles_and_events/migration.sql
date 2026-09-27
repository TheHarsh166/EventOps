-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overbookingBuffer" INTEGER NOT NULL DEFAULT 0;
