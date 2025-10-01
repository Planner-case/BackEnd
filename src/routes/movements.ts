import { FastifyInstance } from "fastify";
import { createMovementSchema, updateMovementSchema } from "../schemas/movement.schema";
import { Prisma } from "@prisma/client";

export default async function movementsRoutes(server: FastifyInstance) {
  server.post("/", async (req, reply) => {
    const parsed = createMovementSchema.parse(req.body);
    const movement = await server.prisma.movement.create({ data: parsed });
    return reply.code(201).send(movement);
  });

  server.get("/", async () => {
    return server.prisma.movement.findMany();
  });

  server.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const movement = await server.prisma.movement.findUnique({
      where: { id: Number(id) },
    });
    if (!movement) return reply.code(404).send({ message: "Not found" });
    return movement;
  });

  server.patch("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateMovementSchema.parse(req.body);
    const movement = await server.prisma.movement.update({
      where: { id: Number(id) },
      data: parsed,
    });
    return movement;
  });

  server.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await server.prisma.movement.delete({ where: { id: Number(id) } });
      return reply.code(204).send();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return reply.code(404).send({ message: "Not found" });
        }
      }
      throw e;
    }
  });
}
