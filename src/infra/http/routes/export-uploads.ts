import { exportUploads } from "@/functions/export-uploads";

import { unwrapEither } from "@/shared/either";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const exportUploadsRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/uploads/get",
    {
      schema: {
        summary: "export  uploads",
        tags: ["uploads"],
        response: {
          200: z.object({
            reportUrl: z.string(),
          }),
        },
        querystring: z.object({
          searchQuery: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { searchQuery } = request.query;

      const result = await exportUploads({
        searchQuery,
      });

      const { reportUrl } = unwrapEither(result);

      return reply.status(200).send({ reportUrl });
    },
  );
};
