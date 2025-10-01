import { FastifyInstance } from "fastify";
import { createSimulationSchema, updateSimulationSchema } from "../schemas/simulation.schema";
import { calculateProjection } from "../services/projection";
import { buildTimeline } from "../services/timeline";

export default async function simulationsRoutes(server: FastifyInstance) {
  
  server.post("/", async (req, reply) => {
    const parsed = createSimulationSchema.parse(req.body);

    const simulation = await server.prisma.simulation.create({
      data: parsed,
    });

    return reply.code(201).send(simulation);
  });

  server.get("/", async () => {
    return server.prisma.simulation.findMany({
      include: {
        versions: true,
        allocations: true,
        movements: true,
        insurances: true,
      },
    });
  });

  server.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const simulation = await server.prisma.simulation.findUnique({
      where: { id: Number(id) },
      include: {
        versions: true,
        allocations: true,
        movements: true,
        insurances: true,
      },
    });

    if (!simulation) return reply.code(404).send({ message: "Not found" });
    return simulation;
  });

  server.patch("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSimulationSchema.parse(req.body);
    const simulation = await server.prisma.simulation.update({
      where: { id: Number(id) },
      data: parsed,
    });
    return simulation;
  });

  server.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await server.prisma.simulation.delete({ where: { id: Number(id) } });
    return reply.code(204).send();
  });

  server.get("/:id/projection", async (req, reply) => {
  const { id } = req.params as { id: string };

    const simulation = await server.prisma.simulation.findUnique({
      where: { id: Number(id) },
      include: {
        allocations: true,
        movements: true,
        insurances: true,
      },
    });

    if (!simulation) {
      return reply.code(404).send({ message: "Simulation not found" });
    }

    const projection = calculateProjection(simulation);

    return projection;
});

  server.post("/:id/version", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { name, rate, status } = (req.body || {}) as { name?: string; rate?: number; status?: string };

    const original = await server.prisma.simulation.findUnique({
      where: { id: Number(id) },
      include: {
        allocations: true,
        movements: true,
        insurances: true,
      },
    });

    if (!original) {
      return reply.code(404).send({ message: "Simulation not found" });
    }

    const rootId = original.parentId ?? original.id;

    const latestVersion = await server.prisma.simulation.findFirst({
      where: { OR: [{ id: rootId }, { parentId: rootId }] },
      orderBy: { version: "desc" },
    });

    const nextVersion = latestVersion ? latestVersion.version + 1 : 2;

    const newSim = await server.prisma.simulation.create({
      data: {
        name: name ?? original.name,
        startDate: new Date(),
        rate: rate ?? original.rate,
        status: (status as any) ?? original.status,
        version: nextVersion,
        parentId: original.parentId ?? original.id,
        allocations: {
          create: original.allocations.map((a) => ({
            type: a.type,
            name: a.name,
            value: a.value,
            date: a.date,
          })),
        },
        movements: {
          create: original.movements.map((m) => ({
            type: m.type,
            value: m.value,
            frequency: m.frequency,
            startDate: m.startDate,
            endDate: m.endDate,
          })),
        },
        insurances: {
          create: original.insurances.map((i) => ({
            name: i.name,
            startDate: i.startDate,
            duration: i.duration,
            premium: i.premium,
            insuredValue: i.insuredValue,
          })),
        },
      },
      include: { allocations: true, movements: true, insurances: true },
    });

    return reply.code(201).send(newSim);
  });


  server.get("/:id/versions", async (req, reply) => {
    const { id } = req.params as { id: string };
    const simulation = await server.prisma.simulation.findUnique({
      where: { id: Number(id) },
    });

    if (!simulation) {
      return reply.code(404).send({ message: "Simulation not found" });
    }

    const parentId = simulation.parentId ?? simulation.id;

    const versions = await server.prisma.simulation.findMany({
      where: {
        OR: [{ id: parentId }, { parentId: parentId }],
      },
      orderBy: { version: "asc" },
    });

    return versions;
  });

  server.get("/:id/timeline", async (req, reply) => {
  const { id } = req.params as { id: string };

    const simulation = await server.prisma.simulation.findUnique({
      where: { id: Number(id) },
      include: {
        allocations: true,
        movements: true,
        insurances: true,
      },
    });

    if (!simulation) {
      return reply.code(404).send({ message: "Simulation not found" });
    }

    const timeline = buildTimeline(simulation);

    return timeline;
  });

}
