import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import { uploadImageRoute } from "./routes/upload-image";
import { transformSiwaggerSchema } from "./transform-swagger-chema";
import { getUploadsRoute } from "./routes/get-uploads";
import { exportUploadsRoute } from "./routes/export-uploads";
import { getHealthCheck } from "./routes/health-check";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation Error",
      issues: error.validation,
    });
  }

  console.error(error);
  return reply.status(500).send({ message: "Internal Server Error" });
});

server.register(fastifyMultipart);

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Upload Server",
      description: "API docs",
      version: "1.0.0",
    },
  },
  transform: transformSiwaggerSchema,
});

server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

server.register(fastifyCors, {
  origin: "*",
});

//routes
server.register(uploadImageRoute);
server.register(getUploadsRoute);
server.register(exportUploadsRoute);
server.register(getHealthCheck);

server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});
