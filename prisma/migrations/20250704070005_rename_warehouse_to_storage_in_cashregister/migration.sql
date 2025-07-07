/*
  Warnings:

  - You are about to drop the column `warehouseId` on the `CashRegister` table. All the data in the column will be lost.
  - Added the required column `storageId` to the `CashRegister` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CashRegister" DROP CONSTRAINT "CashRegister_warehouseId_fkey";

-- AlterTable
ALTER TABLE "CashRegister" DROP COLUMN "warehouseId",
ADD COLUMN     "storageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "obligation" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN     "obligation" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
