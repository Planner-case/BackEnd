import { FastifyInstance } from "fastify";
import buildServer from "../../src/index";

describe("Rotas de Alocação (/allocations)", () => {
  let app: FastifyInstance;
  let simulationId: number;

  beforeAll(async () => {
    app = await buildServer();
  });

  beforeEach(async () => {
    const sim = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Alocação",
        startDate: new Date(Date.UTC(2025, 0, 1)),
        rate: 0.05,
        status: "VIVO",
      },
    });
    simulationId = sim.id;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await app.prisma.allocation.deleteMany();
    await app.prisma.movement.deleteMany();
    await app.prisma.insurance.deleteMany();
    await app.prisma.simulation.deleteMany();
  });

  it("deve criar uma nova alocação (POST /)", async () => {
    const allocationData = {
      simulationId: simulationId,
      name: "Tesouro Selic",
      type: "FINANCEIRA" as const,
      value: 5000,
      date: new Date(Date.UTC(2025, 0, 1)).toISOString(),
    };

    const response = await app.inject({
      method: "POST",
      url: "/allocations",
      payload: allocationData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(allocationData.name);
    expect(body.simulationId).toBe(simulationId);
  });

  it("deve definir hasFinancing como falso por padrão quando não fornecido", async () => {
    const allocationData = {
      simulationId: simulationId,
      name: "Tesouro Selic no default",
      type: "FINANCEIRA" as const,
      value: 5000,
      date: new Date(Date.UTC(2025, 0, 1)).toISOString(),
    };

    const response = await app.inject({
      method: "POST",
      url: "/allocations",
      payload: allocationData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.hasFinancing).toBe(false);
  });

  it("deve listar todas as alocações (GET /)", async () => {
    await app.prisma.allocation.create({
      data: {
        simulationId: simulationId,
        name: "Ação XYZ",
        type: "FINANCEIRA",
        value: 10000,
        date: new Date(Date.UTC(2025, 0, 1)),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/allocations",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Ação XYZ");
  });

  it("deve obter uma alocação específica pelo id (GET /:id)", async () => {
    const allocation = await app.prisma.allocation.create({
      data: {
        simulationId: simulationId,
        name: "Alocação Específica",
        type: "FINANCEIRA",
        value: 1000,
        date: new Date(),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/allocations/${allocation.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(allocation.id);
  });

  it("deve retornar 404 para uma alocação inexistente (GET /:id)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/allocations/999",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve atualizar uma alocação (PATCH /:id)", async () => {
    const allocation = await app.prisma.allocation.create({
      data: {
        simulationId: simulationId,
        name: "Alocação para Atualizar",
        type: "FINANCEIRA",
        value: 2000,
        date: new Date(),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/allocations/${allocation.id}`,
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("Nome Atualizado");
  });

  it("deve deletar uma alocação (DELETE /:id)", async () => {
    const allocation = await app.prisma.allocation.create({
      data: {
        simulationId: simulationId,
        name: "Alocação para Deletar",
        type: "FINANCEIRA",
        value: 3000,
        date: new Date(),
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/allocations/${allocation.id}`,
    });

    expect(response.statusCode).toBe(204);
  });
});