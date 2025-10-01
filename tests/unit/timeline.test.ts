import { buildTimeline } from "../../src/services/timeline";
import { Prisma, AllocationType, MovementType, MovementFrequency, SimulationStatus } from "@prisma/client";

type SimulationWithRelations = Prisma.SimulationGetPayload<{
  include: {
    allocations: true;
    movements: true;
    insurances: true;
    versions: true;
  };
}>;

describe('construirLinhaDoTempo', () => {
    const simBase: SimulationWithRelations = {
        id: 1,
        name: 'Simulação Teste',
        startDate: new Date('2023-01-01T00:00:00.000Z'),
        rate: 0.05,
        status: SimulationStatus.VIVO,
        version: 1,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        allocations: [],
        movements: [],
        insurances: [],
        versions: [],
    };

    it('deve incluir alocações a partir do ano de início', () => {
        const simComAlocacoes: SimulationWithRelations = {
            ...simBase,
            allocations: [
                {
                    id: 1, simulationId: 1, type: AllocationType.FINANCEIRA, name: 'Ação X', value: 1000,
                    date: new Date('2023-05-10T00:00:00.000Z'), hasFinancing: false, startDate: null, installments: null, interestRate: null, downPayment: null
                },
                {
                    id: 2, simulationId: 1, type: AllocationType.IMOBILIZADA, name: 'Imóvel Y', value: 50000,
                    date: new Date('2022-12-25T00:00:00.000Z'), hasFinancing: false, startDate: null, installments: null, interestRate: null, downPayment: null
                },
            ],
        };

        const linhaDoTempo = buildTimeline(simComAlocacoes);
        const eventosDeAlocacao = linhaDoTempo.filter(e => e.event.startsWith('Alocação'));

        expect(eventosDeAlocacao).toHaveLength(1);
        expect(eventosDeAlocacao[0].year).toBe(2023);
        expect(eventosDeAlocacao[0].event).toContain('Ação X');
    });

    it('deve lidar com movimentações mensais corretamente', () => {
        const simComMovimentacoes: SimulationWithRelations = {
            ...simBase,
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 100, frequency: MovementFrequency.MENSAL,
                    startDate: new Date('2023-01-01T00:00:00.000Z'), endDate: new Date('2024-12-31T00:00:00.000Z')
                },
            ],
        };

        const linhaDoTempo = buildTimeline(simComMovimentacoes);
        const eventosDeEntrada = linhaDoTempo.filter(e => e.event === 'Entrada');

        expect(eventosDeEntrada).toHaveLength(2);
        expect(eventosDeEntrada.every(e => e.impact === 1200)).toBe(true);
    });

    it('deve lidar com movimentações de saída quando o status é MORTO', () => {
        const simComMovimentacoes: SimulationWithRelations = {
            ...simBase,
            status: SimulationStatus.MORTO,
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.SAIDA, value: 200, frequency: MovementFrequency.MENSAL,
                    startDate: new Date('2023-01-01T00:00:00.000Z'), endDate: new Date('2023-12-31T00:00:00.000Z')
                },
            ],
        };

        const linhaDoTempo = buildTimeline(simComMovimentacoes);
        const eventosDeSaida = linhaDoTempo.filter(e => e.event.startsWith('Saída'));

        expect(eventosDeSaida).toHaveLength(1);
        expect(eventosDeSaida[0].impact).toBe(-1200);
    });

    it('deve incluir prêmios de seguro e valor segurado corretamente', () => {
        const simComSeguros: SimulationWithRelations = {
            ...simBase,
            insurances: [
                {
                    id: 1, simulationId: 1, name: 'Seguro de Vida', startDate: new Date('2024-01-01T00:00:00.000Z'),
                    duration: 24, premium: 50, insuredValue: 100000
                },
            ],
        };

        const linhaDoTempo = buildTimeline(simComSeguros);
        const eventosDePremio = linhaDoTempo.filter(e => e.event.startsWith('Prêmio seguro'));
        const eventosDeValorSegurado = linhaDoTempo.filter(e => e.event.startsWith('Valor segurado'));

        expect(eventosDePremio).toHaveLength(3);
        expect(eventosDePremio.every(e => e.impact === -600)).toBe(true);
        expect(eventosDeValorSegurado).toHaveLength(1);
        expect(eventosDeValorSegurado[0].year).toBe(2024);
        expect(eventosDeValorSegurado[0].impact).toBe(100000);
    });

    it('deve ordenar todos os eventos por ano', () => {
        const simComTudo: SimulationWithRelations = {
            ...simBase,
            allocations: [{ id: 1, simulationId: 1, type: AllocationType.FINANCEIRA, name: 'A', value: 1, date: new Date('2025-01-01T00:00:00.000Z'), hasFinancing: false, startDate: null, installments: null, interestRate: null, downPayment: null }],
            movements: [{ id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 1, frequency: MovementFrequency.ANUAL, startDate: new Date('2024-01-01T00:00:00.000Z'), endDate: new Date('2024-12-31T00:00:00.000Z') }],
            insurances: [{ id: 1, simulationId: 1, name: 'S', startDate: new Date('2023-01-01T00:00:00.000Z'), duration: 12, premium: 1, insuredValue: 1 }],
        };

        const linhaDoTempo = buildTimeline(simComTudo);

        expect(linhaDoTempo[0].year).toBe(2023);
        expect(linhaDoTempo[linhaDoTempo.length - 1].year).toBe(2025);
    });

    it('deve lidar com movimentações de frequência UNICA', () => {
        const sim: SimulationWithRelations = {
            ...simBase,
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 5000, frequency: MovementFrequency.UNICA,
                    startDate: new Date('2025-01-01T00:00:00.000Z'), endDate: null
                },
            ],
        };
        const timeline = buildTimeline(sim);
        const uniqueEvents = timeline.filter(e => e.event === 'Entrada');
        expect(uniqueEvents).toHaveLength(1);
        expect(uniqueEvents[0].year).toBe(2025);
        expect(uniqueEvents[0].impact).toBe(5000);
    });

    it('não deve incluir movimentações de ENTRADA se o status for MORTO', () => {
        const sim: SimulationWithRelations = {
            ...simBase,
            status: SimulationStatus.MORTO,
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 100, frequency: MovementFrequency.MENSAL,
                    startDate: new Date('2023-01-01T00:00:00.000Z'), endDate: new Date('2023-12-31T00:00:00.000Z')
                },
            ],
        };
        const timeline = buildTimeline(sim);
        const entryEvents = timeline.filter(e => e.event === 'Entrada');
        expect(entryEvents).toHaveLength(0);
    });

    it('deve incluir movimentações de SAIDA com valor total se o status for VIVO', () => {
        const sim: SimulationWithRelations = {
            ...simBase,
            status: SimulationStatus.VIVO,
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.SAIDA, value: 150, frequency: MovementFrequency.ANUAL,
                    startDate: new Date('2024-01-01T00:00:00.000Z'), endDate: new Date('2025-12-31T00:00:00.000Z')
                },
            ],
        };
        const timeline = buildTimeline(sim);
        const exitEvents = timeline.filter(e => e.event === 'Saída');
        expect(exitEvents).toHaveLength(2);
        expect(exitEvents[0].impact).toBe(-150);
        expect(exitEvents[1].impact).toBe(-150);
    });

    it('deve continuar as movimentações até o ano final padrão se endDate for nulo', () => {
        const sim: SimulationWithRelations = {
            ...simBase,
            startDate: new Date('2058-01-01T00:00:00.000Z'),
            movements: [
                {
                    id: 1, simulationId: 1, type: MovementType.ENTRADA, value: 100, frequency: MovementFrequency.ANUAL,
                    startDate: new Date('2058-01-01T00:00:00.000Z'), endDate: null
                },
            ],
        };
        const timeline = buildTimeline(sim);
        const entryEvents = timeline.filter(e => e.event === 'Entrada');
        // 2058, 2059, 2060
        expect(entryEvents).toHaveLength(3);
    });
});