import { FastifyInstance } from "fastify";
import buildServer from "../../src/index";

describe("Rotas de Seguros (/insurances)", () => {
  let app: FastifyInstance;
  let simulationId: number;

  beforeAll(async () => {
    app = await buildServer();
  });

  beforeEach(async () => {
    const sim = await app.prisma.simulation.create({
      data: {
        name: "Simulação para Seguro",
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

  it("deve criar um novo seguro (POST /)", async () => {
    const insuranceData = {
      simulationId: simulationId,
      name: "Seguro de Vida",
      premium: 150,
      insuredValue: 200000,
      duration: 120,
      startDate: new Date(Date.UTC(2025, 0, 1)).toISOString(),
    };

    const response = await app.inject({
      method: "POST",
      url: "/insurances",
      payload: insuranceData,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(insuranceData.name);
    expect(body.simulationId).toBe(simulationId);
    expect(body.insuredValue).toBe(insuranceData.insuredValue);
  });

  it("deve listar todos os seguros (GET /)", async () => {
    await app.prisma.insurance.create({
      data: {
        simulationId: simulationId,
        name: "Seguro Residencial",
        premium: 50,
        insuredValue: 100000,
        duration: 12,
        startDate: new Date(Date.UTC(2025, 0, 1)),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/insurances",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Seguro Residencial");
  });

  it("deve obter um seguro específico pelo id (GET /:id)", async () => {
    const insurance = await app.prisma.insurance.create({
      data: {
        simulationId: simulationId,
        name: "Seguro Específico",
        premium: 100,
        insuredValue: 150000,
        duration: 60,
        startDate: new Date(),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/insurances/${insurance.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(insurance.id);
  });

  it("deve retornar 404 para um seguro inexistente (GET /:id)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/insurances/999",
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve atualizar um seguro (PATCH /:id)", async () => {
    const insurance = await app.prisma.insurance.create({
      data: {
        simulationId: simulationId,
        name: "Seguro para Atualizar",
        premium: 200,
        insuredValue: 300000,
        duration: 24,
        startDate: new Date(),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/insurances/${insurance.id}`,
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe("Nome Atualizado");
  });

  it("deve deletar um seguro (DELETE /:id)", async () => {
    const insurance = await app.prisma.insurance.create({
      data: {
        simulationId: simulationId,
        name: "Seguro para Deletar",
        premium: 250,
        insuredValue: 400000,
        duration: 36,
        startDate: new Date(),
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/insurances/${insurance.id}`,
    });

    expect(response.statusCode).toBe(204);
  });

  it("deve retornar 404 para um seguro inexistente (DELETE /:id)", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/insurances/999",
    });

    expect(response.statusCode).toBe(404);
  });
});