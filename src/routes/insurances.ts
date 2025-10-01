import { FastifyInstance } from "fastify";
import { createInsuranceSchema, updateInsuranceSchema } from "../schemas/insurance.schema";
import { Prisma } from "@prisma/client";

export default async function insurancesRoutes(server: FastifyInstance) {
  server.post("/", async (req, reply) => {
    const parsed = createInsuranceSchema.parse(req.body);
    const insurance = await server.prisma.insurance.create({ data: parsed });
    return reply.code(201).send(insurance);
  });

  server.get("/", async () => {
    return server.prisma.insurance.findMany();
  });

  server.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const insurance = await server.prisma.insurance.findUnique({
      where: { id: Number(id) },
    });
    if (!insurance) return reply.code(404).send({ message: "Not found" });
    return insurance;
  });

  server.patch("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateInsuranceSchema.parse(req.body);
    const insurance = await server.prisma.insurance.update({
      where: { id: Number(id) },
      data: parsed,
    });
    return insurance;
  });

  server.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await server.prisma.insurance.delete({ where: { id: Number(id) } });
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
