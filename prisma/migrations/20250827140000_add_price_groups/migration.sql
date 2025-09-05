-- Create price_groups table
CREATE TABLE IF NOT EXISTS price_groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone
);

-- Create price_group_products table
CREATE TABLE IF NOT EXISTS price_group_products (
  id text PRIMARY KEY,
  price_group_id text NOT NULL REFERENCES price_groups(id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES "Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  price numeric(10,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  UNIQUE(price_group_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_group_products_group ON price_group_products(price_group_id);
CREATE INDEX IF NOT EXISTS idx_price_group_products_product ON price_group_products(product_id);

-- Add price_group_id to Partner (snake_case column, maps to Prisma Partner model)
ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS price_group_id text REFERENCES price_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_partner_price_group_id ON "Partner"(price_group_id);
