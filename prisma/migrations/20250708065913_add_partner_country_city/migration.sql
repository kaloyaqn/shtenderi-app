-- AlterTable
ALTER TABLE "CreditNote" ADD COLUMN     "partnerCity" TEXT,
ADD COLUMN     "partnerCountry" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "partnerCity" TEXT,
ADD COLUMN     "partnerCountry" TEXT;

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT;
