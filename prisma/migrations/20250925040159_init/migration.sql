-- CreateEnum
CREATE TYPE "public"."SimulationStatus" AS ENUM ('VIVO', 'MORTO', 'INVALIDO');

-- CreateEnum
CREATE TYPE "public"."AllocationType" AS ENUM ('FINANCEIRA', 'IMOBILIZADA');

-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "public"."MovementFrequency" AS ENUM ('UNICA', 'MENSAL', 'ANUAL');

-- CreateTable
CREATE TABLE "public"."Simulation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0.04,
    "status" "public"."SimulationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Version" (
    "id" SERIAL NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Allocation" (
    "id" SERIAL NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "type" "public"."AllocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hasFinancing" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "installments" INTEGER,
    "interestRate" DOUBLE PRECISION,
    "downPayment" DOUBLE PRECISION,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movement" (
    "id" SERIAL NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "type" "public"."MovementType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "frequency" "public"."MovementFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insurance" (
    "id" SERIAL NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "insuredValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Version" ADD CONSTRAINT "Version_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Allocation" ADD CONSTRAINT "Allocation_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movement" ADD CONSTRAINT "Movement_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Insurance" ADD CONSTRAINT "Insurance_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
