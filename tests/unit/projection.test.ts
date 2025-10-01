import { calculateProjection } from "../../src/services/projection";
import { Prisma, SimulationStatus, AllocationType, MovementType, MovementFrequency } from '@prisma/client';

type SimulationWithRelations = Prisma.SimulationGetPayload<{
  include: {
    allocations: true;
    movements: true;
    insurances: true;
    versions: true;
  };
}>;

const simBase: SimulationWithRelations = {
  id: 1,
  name: "Simulação Teste",
  startDate: new Date(Date.UTC(2025, 0, 1)),
  rate: 0.04,
  status: SimulationStatus.VIVO,
  version: 1,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  allocations: [
    {
      id: 1, simulationId: 1, type: AllocationType.FINANCEIRA, name: "Tesouro", value: 1000.00,
      date: new Date(Date.UTC(2025, 0, 1)), hasFinancing: false, startDate: null, installments: null, interestRate: null, downPayment: null
    },
    {
      id: 2, simulationId: 1, type: AllocationType.IMOBILIZADA, name: "Casa", value: 50000.00,
      date: new Date(Date.UTC(2025, 0, 1)), hasFinancing: false, startDate: null, installments: null, interestRate: null, downPayment: null
    }
  ],
  movements: [
    {
      id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 5000.00, frequency: MovementFrequency.ANUAL,
      startDate: new Date(Date.UTC(2025, 0, 1)), endDate: null
    }
  ],
  insurances: [
    {
      id: 1, simulationId: 1, name: "Vida", startDate: new Date(Date.UTC(2025, 0, 1)),
      duration: 24, premium: 200.00, insuredValue: 100000.00
    }
  ],
  versions: [],
};


describe("calcularProjecao (unitário)", () => {
  it("deve calcular o patrimônio inicial e separar financeiro/imobilizado", () => {
    const projecao = calculateProjection(simBase);
    const p2025 = projecao.find(p => p.year === 2025);

    expect(p2025).toBeDefined();

    if (p2025) {
      expect(p2025.imobilizado).toBe(50000);
      expect(p2025.total).toBe(p2025.financeiro + 50000);
    }
  });

  it("deve aplicar juros apenas sobre o patrimônio financeiro", () => {
    const projecao = calculateProjection(simBase);
    const p2025 = projecao.find(p => p.year === 2025);
    const p2026 = projecao.find(p => p.year === 2026);

    expect(p2025).toBeDefined();
    expect(p2026).toBeDefined();

    if (p2025 && p2026) {
      expect(p2026.imobilizado).toBe(50000);
      expect(p2026.financeiro).toBeGreaterThan(p2025.financeiro);
    }
  });

  it("deve usar a taxa padrão quando não fornecida", () => {
    const simSemTaxa = { ...simBase, rate: null };
    const projecao = calculateProjection(simSemTaxa as any);
    const p2025 = projecao.find(p => p.year === 2025);
    const p2026 = projecao.find(p => p.year === 2026);

    expect(p2025).toBeDefined();
    expect(p2026).toBeDefined();

    if (p2025 && p2026) {
      expect(p2026.financeiro).toBeGreaterThan(p2025.financeiro);
    }
  });

  it("deve considerar seguros afetando o total e o totalSemSeguros", () => {
    const projecao = calculateProjection(simBase);
    const p2025 = projecao.find(p => p.year === 2025);

    expect(p2025).toBeDefined();

    if (p2025) {
      expect(p2025.total).toBeGreaterThan(p2025.totalSemSeguros);
    }
  });
});