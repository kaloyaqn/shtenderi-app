-- Add saleAmount column to Revision table
ALTER TABLE "Revision" ADD COLUMN "saleAmount" DECIMAL(10,2) DEFAULT 0.00;

-- Create trigger function to automatically update saleAmount
CREATE OR REPLACE FUNCTION update_revision_sale_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the saleAmount for the affected revision
  UPDATE "Revision"
  SET "saleAmount" = (
    SELECT COALESCE(SUM("missingQuantity" * COALESCE("priceAtSale", p."clientPrice", 0)), 0)
    FROM "MissingProduct" mp 
    JOIN "Product" p ON mp."productId" = p.id 
    WHERE mp."revisionId" = COALESCE(NEW."revisionId", OLD."revisionId")
  )
  WHERE id = COALESCE(NEW."revisionId", OLD."revisionId");
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires on MissingProduct changes
DROP TRIGGER IF EXISTS trigger_update_revision_sale_amount ON "MissingProduct";
CREATE TRIGGER trigger_update_revision_sale_amount 
  AFTER INSERT OR UPDATE OR DELETE ON "MissingProduct" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_revision_sale_amount();

-- Backfill existing revisions with calculated saleAmount
UPDATE "Revision" 
SET "saleAmount" = (
  SELECT COALESCE(SUM("missingQuantity" * COALESCE("priceAtSale", p."clientPrice", 0)), 0)
  FROM "MissingProduct" mp 
  JOIN "Product" p ON mp."productId" = p.id 
  WHERE mp."revisionId" = "Revision".id
);
