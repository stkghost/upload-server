import { FastifySchema } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

interface SchemaBodyProps {
  properties: {
    file: {
      type: string;
      format: string;
    };
  };
  required: string[];
  type: string;
}
type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0];

export function transformSiwaggerSchema(data: TransformSwaggerSchemaData) {
  const { schema, url } = jsonSchemaTransform(data);

  if (schema.consumes?.includes("multipart/form-data")) {
    if (schema.body === undefined) {
      schema.body = {
        type: "object",
        required: [],
        properties: {},
      };
    }

    if (schema.body) {
      //@ts-expect-error error
      if (schema.body.properties && schema.body.required) {
        //@ts-expect-error error
        schema.body.properties.file = {
          type: "string",
          format: "binary",
        };
        //@ts-expect-error error
        schema.body.required.push("file");
      }
    }
  }
  return { schema, url };
}
