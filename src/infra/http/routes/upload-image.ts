import { uploadImage } from "@/functions/upload-image";
import { isRight, unwrapEither } from "@/shared/either";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/uploads",
    {
      schema: {
        summary: "Upload an Image",
        consumes: ["multipart/form-data"],
        tags: ["uploads"],

        response: {
          201: z.null().describe("Image uploaded."),
          400: z
            .object({ message: z.string() })
            .describe("Upload already exists"),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 12024 * 2, //2mb
        },
      });

      if (!uploadedFile) {
        return reply.status(400).send({ message: "File is required" });
      }

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      });

      if (uploadedFile.file.truncated) {
        return reply.status(400).send({ message: "File size limit reached" });
      }

      if (isRight(result)) {
        return reply.status(201).send(null);
      }

      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case "InvalidFileFormat":
          reply.status(400).send({ message: "error.message" });
      }
    },
  );
};
