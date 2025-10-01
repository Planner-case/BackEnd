import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

const prisma = new PrismaClient();

export default fp(async (server) => {
  
  server.decorate("prisma", prisma);

  server.addHook("onClose", async (srv) => {
    await srv.prisma.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}