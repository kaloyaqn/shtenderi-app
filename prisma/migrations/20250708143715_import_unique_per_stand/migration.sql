/*
  Warnings:

  - A unique constraint covering the columns `[fileName,standId]` on the table `Import` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Import_fileName_standId_key" ON "Import"("fileName", "standId");
