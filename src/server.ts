import buildServer from "./index";

(async () => {
  const server = await buildServer();
  server.listen({ port: 4000, host: "0.0.0.0" });
})();