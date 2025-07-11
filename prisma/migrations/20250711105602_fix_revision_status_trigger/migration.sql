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
    SELECT COALESCE(SUM("missingQuantity" * COALESCE("priceAtSale", 0)), 0) INTO total_due
    FROM "MissingProduct"
    WHERE "revisionId" = NEW."revisionId";

    -- Update the status in the Revision table
    UPDATE "Revision"
    SET "status" = CASE
        WHEN total_payments >= total_due AND total_due > 0 THEN 'PAID'::"RevisionStatus"
        ELSE 'NOT_PAID'::"RevisionStatus"
    END
    WHERE id = NEW."revisionId";

    RETURN NULL;
END;
$$ LANGUAGE plpgsql; 