import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { Either, makeRight } from "@/shared/either";

import { z } from "zod";
import { asc, count, desc, ilike } from "drizzle-orm";

const getUploadsInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(["createdAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
});

type GetUploadsInput = z.input<typeof getUploadsInput>;

type GetUploadsResponse = {
  uploads: {
    id: string;
    name: string;
    remoteKey: string;
    remoteUrl: string;
    createdAt: Date;
  }[];
  total: number;
};

export async function getUploads(
  input: GetUploadsInput,
): Promise<Either<never, GetUploadsResponse>> {
  const { page, pageSize, searchQuery, sortBy, sortDirection } =
    getUploadsInput.parse(input);

  const [uploads, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.uploads.id,
        name: schema.uploads.name,
        remoteUrl: schema.uploads.remoteUrl,
        remoteKey: schema.uploads.remoteKey,
        createdAt: schema.uploads.createdAt,
      })
      .from(schema.uploads)
      .where(
        searchQuery
          ? ilike(schema.uploads.name, `%${searchQuery}%`)
          : undefined,
      )
      .orderBy((fields) => {
        if (sortBy && sortDirection === "asc") {
          return asc(fields[sortBy]);
        }
        if (sortBy && sortDirection === "desc") {
          return desc(fields[sortBy]);
        }

        return desc(fields.id);
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.uploads.id) })
      .from(schema.uploads)
      .where(
        searchQuery
          ? ilike(schema.uploads.name, `%${searchQuery}%`)
          : undefined,
      ),
  ]);

  return makeRight({ uploads, total });
}
