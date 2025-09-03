-- Rollback: drop partner FK column and custom tables
ALTER TABLE "Partner" DROP COLUMN IF EXISTS price_group_id;
DROP INDEX IF EXISTS idx_partner_price_group_id;

DROP INDEX IF EXISTS idx_price_group_products_product;
DROP INDEX IF EXISTS idx_price_group_products_group;
DROP TABLE IF EXISTS price_group_products;
DROP TABLE IF EXISTS price_groups;
