/*
  Warnings:

  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_simulationId_fkey";

-- AlterTable
ALTER TABLE "public"."Simulation" ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "status" SET DEFAULT 'VIVO';

-- DropTable
DROP TABLE "public"."Version";

-- AddForeignKey
ALTER TABLE "public"."Simulation" ADD CONSTRAINT "Simulation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Simulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
