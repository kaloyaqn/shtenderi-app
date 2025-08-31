-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deliveryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Trigger: Set active = false if clientPrice = 0, true otherwise
CREATE OR REPLACE FUNCTION update_active_based_on_client_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."clientPrice" = 0 THEN
    NEW.active := FALSE;
  ELSE
    NEW.active := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_active_on_client_price ON "Product";

CREATE TRIGGER trg_update_active_on_client_price
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION update_active_based_on_client_price();