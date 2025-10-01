import { FastifyInstance } from "fastify";
import buildServer from "../../src/index";

describe("Rotas de Movimentações (/movements)", () => {
  let app: FastifyInstance;
  let simulationId: number;

  beforeAll(async () => {
    app = await buildServer();
  });

  beforeEach(async () => {
    const sim = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Movimentação",
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

  it("deve criar uma nova movimentação (POST /)", async () => {
    const movementData = {
      simulationId: simulationId,
      type: "ENTRADA" as const,
      frequency: "MENSAL" as const,
      value: 7000,
      startDate: new Date(Date.UTC(2025, 1, 5)).toISOString(),
    };

    const response = await app.inject({
      method: "POST",
      url: "/movements",
      payload: movementData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(body.value).toBe(movementData.value);
    expect(body.simulationId).toBe(simulationId);
  });

  it("deve criar uma nova movimentação com data final (POST /)", async () => {
    const movementData = {
      simulationId: simulationId,
      type: "SAIDA" as const,
      frequency: "UNICA" as const,
      value: 1000,
      startDate: new Date(Date.UTC(2025, 1, 5)).toISOString(),
      endDate: new Date(Date.UTC(2026, 1, 5)).toISOString(),
    };

    const response = await app.inject({
      method: "POST",
      url: "/movements",
      payload: movementData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.endDate).toBeDefined();
  });

  it("deve listar todas as movimentações (GET /)", async () => {
    await app.prisma.movement.create({
      data: {
        simulationId: simulationId,
        type: "SAIDA",
        frequency: "MENSAL",
        value: 1500,
        startDate: new Date(Date.UTC(2025, 0, 10)),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/movements",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].value).toBe(1500);
  });

  it("deve obter uma movimentação específica pelo id (GET /:id)", async () => {
    const movement = await app.prisma.movement.create({
      data: {
        simulationId: simulationId,
        type: "ENTRADA",
        frequency: "UNICA",
        value: 10000,
        startDate: new Date(),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/movements/${movement.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(movement.id);
  });

  it("deve retornar 404 para uma movimentação inexistente (GET /:id)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/movements/999",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve atualizar uma movimentação (PATCH /:id)", async () => {
    const movement = await app.prisma.movement.create({
      data: {
        simulationId: simulationId,
        type: "SAIDA",
        frequency: "ANUAL",
        value: 500,
        startDate: new Date(),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/movements/${movement.id}`,
      payload: { value: 600 },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.value).toBe(600);
  });

  it("deve deletar uma movimentação (DELETE /:id)", async () => {
    const movement = await app.prisma.movement.create({
      data: {
        simulationId: simulationId,
        type: "SAIDA",
        frequency: "UNICA",
        value: 400,
        startDate: new Date(Date.UTC(2027, 0, 15)),
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/movements/${movement.id}`,
    });

    expect(response.statusCode).toBe(204);
  });

  it("deve retornar 404 para uma movimentação inexistente (DELETE /:id)", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/movements/999",
    });

    expect(response.statusCode).toBe(404);
  });
});