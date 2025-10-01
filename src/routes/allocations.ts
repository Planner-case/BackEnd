import { FastifyInstance } from "fastify";
import { createAllocationSchema, updateAllocationSchema } from "../schemas/allocation.schema";

export default async function allocationsRoutes(server: FastifyInstance) {
  server.post("/", async (req, reply) => {
    const parsed = createAllocationSchema.parse(req.body);
    const allocation = await server.prisma.allocation.create({ data: parsed });
    return reply.code(201).send(allocation);
  });

  server.get("/", async () => {
    return server.prisma.allocation.findMany();
  });

  server.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const allocation = await server.prisma.allocation.findUnique({
      where: { id: Number(id) },
    });
    if (!allocation) return reply.code(404).send({ message: "Not found" });
    return allocation;
  });

  server.patch("/:id", async (req) => {
    const { id } = req.params as { id: string };
    const parsed = updateAllocationSchema.parse(req.body);
    const allocation = await server.prisma.allocation.update({
      where: { id: Number(id) },
      data: parsed,
    });
    return allocation;
  });

  server.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await server.prisma.allocation.delete({ where: { id: Number(id) } });
    return reply.code(204).send();
  });
}
