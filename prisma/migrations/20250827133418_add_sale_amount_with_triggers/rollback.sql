-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_update_revision_sale_amount ON "MissingProduct";

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_revision_sale_amount();

-- Remove the saleAmount column
ALTER TABLE "Revision" DROP COLUMN IF EXISTS "saleAmount";


