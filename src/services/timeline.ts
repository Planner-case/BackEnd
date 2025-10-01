import { Prisma } from "@prisma/client";

type SimulationWithRelations = Prisma.SimulationGetPayload<{
  include: {
    allocations: true;
    movements: true;
    insurances: true;
  };
}>;

export function buildTimeline(sim: SimulationWithRelations) {
  const startYear = sim.startDate.getUTCFullYear();
  const endYear = 2060;

  const events: { year: number; event: string; impact: number }[] = [];

  sim.allocations.forEach((a) => {
    if (a.date.getUTCFullYear() >= startYear) {
      events.push({
        year: a.date.getUTCFullYear(),
        event: `Alocação: ${a.name} (${a.type})`,
        impact: a.value,
      });
    }
  });

  sim.movements.forEach((m) => {
    const start = m.startDate.getUTCFullYear();
    const end = m.endDate ? m.endDate.getUTCFullYear() : endYear;

    for (let year = start; year <= end; year++) {
      let value = 0;

      switch (m.frequency) {
        case "MENSAL": value = m.value * 12; break;
        case "ANUAL": value = m.value; break;
        case "UNICA": value = year === start ? m.value : 0; break;
      }

      if (value === 0) continue;

      if (m.type === "ENTRADA") {
        if (sim.status === "VIVO") {
          events.push({ year, event: `Entrada`, impact: value });
        }
      } else {
        if (sim.status === "MORTO") {
          events.push({ year, event: `Saída (50%)`, impact: -value / 2 });
        } else {
          events.push({ year, event: `Saída`, impact: -value });
        }
      }
    }
  });

  sim.insurances.forEach((s) => {
    const start = s.startDate.getUTCFullYear();
    const end = start + Math.floor(s.duration / 12);

    for (let year = start; year <= end; year++) {
      events.push({
        year,
        event: `Prêmio seguro: ${s.name}`,
        impact: -s.premium * 12,
      });

      if (year === start) {
        events.push({
          year,
          event: `Valor segurado: ${s.name}`,
          impact: s.insuredValue,
        });
      }
    }
  });

  events.sort((a, b) => a.year - b.year);

  return events;
}
