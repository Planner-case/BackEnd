import { FastifyInstance } from "fastify";
import buildServer from "../../src/index";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
});

afterAll(async () => {
  await app.close();
});

describe("Rotas de Simulações (/simulations)", () => {
  afterEach(async () => {
    await app.prisma.allocation.deleteMany();
    await app.prisma.movement.deleteMany();
    await app.prisma.insurance.deleteMany();
    await app.prisma.simulation.deleteMany();
  });

  it("deve criar uma nova simulação (POST /)", async () => {
    const simulationData = {
      name: "Minha Primeira Simulação",
      startDate: new Date(Date.UTC(2024, 0, 1)).toISOString(),
      rate: 0.05,
      status: "VIVO",
    };

    const response = await app.inject({
      method: "POST",
      url: "/simulations",
      payload: simulationData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(simulationData.name);
    expect(body.rate).toBe(simulationData.rate);
  });

  it("deve listar todas as simulações (GET /)", async () => {
    await app.prisma.simulation.create({
      data: {
        name: "Simulação para Listagem",
        startDate: new Date(Date.UTC(2025, 0, 1)),
        rate: 0.05,
        status: "VIVO",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/simulations",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Simulação para Listagem");
  });

  it("deve obter uma simulação específica pelo id (GET /:id)", async () => {
    const simulation = await app.prisma.simulation.create({
      data: {
        name: "Simulação Específica",
        startDate: new Date(Date.UTC(2026, 0, 1)),
        rate: 0.08,
        status: "VIVO",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/simulations/${simulation.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(simulation.id);
    expect(body.name).toBe("Simulação Específica");
  });

  it("deve retornar 404 para uma simulação inexistente (GET /:id)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/simulations/999",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve deletar uma simulação (DELETE /:id)", async () => {
    const simulation = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Deletar",
        startDate: new Date(Date.UTC(2027, 0, 1)),
        rate: 0.1,
        status: "VIVO",
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/simulations/${simulation.id}`,
    });

    expect(response.statusCode).toBe(204);
  });

  it("deve obter a projeção para uma simulação (GET /:id/projection)", async () => {
    const simulation = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Projeção",
        startDate: new Date(Date.UTC(2028, 0, 1)),
        rate: 0.06,
        status: "VIVO",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/simulations/${simulation.id}/projection`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it("deve retornar 404 para uma simulação inexistente (GET /:id/projection)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/simulations/999/projection",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve criar uma nova versão de uma simulação (POST /:id/version)", async () => {
    const simulation = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Versionar",
        startDate: new Date(Date.UTC(2029, 0, 1)),
        rate: 0.07,
        status: "VIVO",
        allocations: {
          create: { type: "FINANCEIRA", name: "Alocação Teste", value: 1000, date: new Date() },
        },
        movements: {
          create: { type: "ENTRADA", value: 100, frequency: "MENSAL", startDate: new Date() },
        },
        insurances: {
          create: { name: "Seguro Teste", startDate: new Date(), duration: 12, premium: 50, insuredValue: 10000 },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/simulations/${simulation.id}/version`,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.version).toBe(2);
    expect(body.parentId).toBe(simulation.id);
  });

  it("deve retornar 404 para uma simulação inexistente (POST /:id/version)", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/simulations/999/version",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve obter a linha do tempo para uma simulação (GET /:id/timeline)", async () => {
    const simulation = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Timeline",
        startDate: new Date(Date.UTC(2030, 0, 1)),
        rate: 0.09,
        status: "VIVO",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/simulations/${simulation.id}/timeline`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
  });

  it("deve retornar 404 para uma simulação inexistente (GET /:id/timeline)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/simulations/999/timeline",
    });

    expect(response.statusCode).toBe(404);
  });
});