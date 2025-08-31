/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `Import` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fileName` on table `Import` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Import_fileName_standId_key";

-- AlterTable
ALTER TABLE "Import" ALTER COLUMN "fileName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Import_fileName_key" ON "Import"("fileName");
