import { Prisma } from "@prisma/client";
import { buildTimeline } from "./timeline";

type SimulationWithRelations = Prisma.SimulationGetPayload<{
  include: {
    allocations: true;
    movements: true;
    insurances: true;
  };
}>;

export function calculateProjection(sim: SimulationWithRelations) {
  const startYear = sim.startDate.getFullYear();
  const endYear = 2060;
  const rate = sim.rate ?? 0.04;

  const events = buildTimeline(sim);

  let financeiro = getInitialPatrimonio(sim, "FINANCEIRA");
  let imobilizado = getInitialPatrimonio(sim, "IMOBILIZADA");

  const projection: {
    year: number;
    financeiro: number;
    imobilizado: number;
    total: number;
    totalSemSeguros: number;
  }[] = [];

  for (let year = startYear; year <= endYear; year++) {
    financeiro *= 1 + rate;

    const yearEvents = events.filter((e) => e.year === year);

    let impactoComSeguro = 0;
    let impactoSemSeguro = 0;

    yearEvents.forEach((e) => {
      if (e.event.startsWith("Prêmio seguro") || e.event.startsWith("Valor segurado")) {
        impactoComSeguro += e.impact;
      } else {
        impactoComSeguro += e.impact;
        impactoSemSeguro += e.impact;
      }
    });

    financeiro += impactoComSeguro;
    const financeiroSemSeguros = financeiro - impactoComSeguro + impactoSemSeguro;

    const total = financeiro + imobilizado;
    const totalSemSeguros = financeiroSemSeguros + imobilizado;

    projection.push({
      year,
      financeiro: Math.round(financeiro),
      imobilizado: Math.round(imobilizado),
      total: Math.round(total),
      totalSemSeguros: Math.round(totalSemSeguros),
    });
  }

  return projection;
}

function getInitialPatrimonio(
  sim: SimulationWithRelations,
  type: "FINANCEIRA" | "IMOBILIZADA"
): number {
  return sim.allocations
    .filter((a) => a.type === type && a.date <= sim.startDate)
    .reduce((sum, a) => sum + a.value, 0);
}
