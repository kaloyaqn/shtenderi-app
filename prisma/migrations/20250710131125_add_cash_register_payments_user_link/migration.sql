/*
  Warnings:

  - The values [IN,OUT,CORRECTION] on the enum `CashMovementType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reason` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CashRegister` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CashMovementType_new" AS ENUM ('DEPOSIT', 'WITHDRAWAL');
ALTER TABLE "CashMovement" ALTER COLUMN "type" TYPE "CashMovementType_new" USING ("type"::text::"CashMovementType_new");
ALTER TYPE "CashMovementType" RENAME TO "CashMovementType_old";
ALTER TYPE "CashMovementType_new" RENAME TO "CashMovementType";
DROP TYPE "CashMovementType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'BANK');
ALTER TABLE "CreditNote" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "CreditNote" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "CreditNote" ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH';
ALTER TABLE "Invoice" ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH';
COMMIT;

-- AlterTable
ALTER TABLE "CashMovement" DROP COLUMN "reason";

-- AlterTable
ALTER TABLE "CashRegister" ADD COLUMN     "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paidAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
