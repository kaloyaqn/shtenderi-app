-- CreateTable
CREATE TABLE "ImportProduct" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ImportProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImportProduct" ADD CONSTRAINT "ImportProduct_importId_fkey" FOREIGN KEY ("importId") REFERENCES "Import"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportProduct" ADD CONSTRAINT "ImportProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
