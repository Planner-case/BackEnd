-- DropForeignKey
ALTER TABLE "public"."Allocation" DROP CONSTRAINT "Allocation_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Insurance" DROP CONSTRAINT "Insurance_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movement" DROP CONSTRAINT "Movement_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Simulation" DROP CONSTRAINT "Simulation_parentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Simulation" ADD CONSTRAINT "Simulation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Allocation" ADD CONSTRAINT "Allocation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movement" ADD CONSTRAINT "Movement_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Insurance" ADD CONSTRAINT "Insurance_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
