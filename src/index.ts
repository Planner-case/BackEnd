import Fastify from "fastify";
import cors from '@fastify/cors';
import prismaPlugin from "./plugins/prisma";
import simulationsRoutes from "./routes/simulations";
import allocationsRoutes from "./routes/allocations";
import movementsRoutes from "./routes/movements";
import insurancesRoutes from "./routes/insurances";

export default async function buildServer() {
  const server = Fastify({
  logger: true,
  });


  server.register(cors, { 
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  server.register(prismaPlugin);
  server.register(simulationsRoutes, { prefix: "/simulations" });
  server.register(allocationsRoutes, { prefix: "/allocations" });
  server.register(movementsRoutes, { prefix: "/movements" });
  server.register(insurancesRoutes, { prefix: "/insurances" });

  server.get("/health", async () => {
    return { status: "ok" };
  });
  
  return server;
}