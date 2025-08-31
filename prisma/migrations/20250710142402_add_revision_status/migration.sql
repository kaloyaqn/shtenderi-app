-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('PAID', 'NOT_PAID');

-- AlterTable
ALTER TABLE "Revision" ADD COLUMN     "status" "RevisionStatus" NOT NULL DEFAULT 'NOT_PAID';


CREATE OR REPLACE FUNCTION update_revision_status()
RETURNS TRIGGER AS $$
DECLARE
    total_payments NUMERIC;
    total_due NUMERIC;
BEGIN
    -- Calculate the sum of all payments for this revision
    SELECT COALESCE(SUM(amount), 0) INTO total_payments
    FROM "Payment"
    WHERE "revisionId" = NEW."revisionId";

    -- Calculate the total due for this revision (sum of missingProducts * priceAtSale)
    -- Use givenQuantity if available, otherwise use missingQuantity
    SELECT COALESCE(SUM(
      CASE 
        WHEN "givenQuantity" IS NOT NULL THEN "givenQuantity" * COALESCE("priceAtSale", 0)
        ELSE "missingQuantity" * COALESCE("priceAtSale", 0)
      END
    ), 0) INTO total_due
    FROM "MissingProduct"
    WHERE "revisionId" = NEW."revisionId";

    -- Update the status in the Revision table
    UPDATE "Revision"
    SET "status" = CASE
        WHEN total_payments >= total_due AND total_due > 0 THEN 'PAID'
        ELSE 'NOT_PAID'
    END
    WHERE id = NEW."revisionId";

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_revision_status_update ON "Payment";

CREATE TRIGGER payment_revision_status_update
AFTER INSERT OR UPDATE OR DELETE ON "Payment"
FOR EACH ROW
EXECUTE FUNCTION update_revision_status();