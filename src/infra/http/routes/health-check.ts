import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getHealthCheck: FastifyPluginAsyncZod = async (server) => {
  server.get("/health", {}, async (request, reply) => {
    return reply.status(200).send({
      message: "Health Check Success ECS!",
    });
  });
};
