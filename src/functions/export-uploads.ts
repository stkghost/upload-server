import { db, pg } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { Either, makeRight } from "@/shared/either";

import { z } from "zod";
import { ilike } from "drizzle-orm";
import { stringify } from "csv-stringify";
import { pipeline } from "node:stream/promises";
import { uploadFileToStorage } from "@/infra/storage/upload-file-to-storage";
import { PassThrough, Transform } from "node:stream";

const exportUploadsInput = z.object({
  searchQuery: z.string().optional(),
});

type exportUploadsInput = z.input<typeof exportUploadsInput>;

export async function exportUploads(
  input: exportUploadsInput,
): Promise<Either<never, { reportUrl: string }>> {
  const { searchQuery } = exportUploadsInput.parse(input);

  const { sql, params } = db
    .select({
      id: schema.uploads.id,
      name: schema.uploads.name,
      remoteUrl: schema.uploads.remoteUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(
      searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined,
    )
    .toSQL();

  const cursor = pg.unsafe(sql, params as string[]).cursor(1);

  //   for await (const rows of cursor) {
  //     console.log(rows);
  //   }

  const csv = stringify({
    delimiter: ",",
    header: true,
    columns: [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      { key: "remote_url", header: "URL" },
      { key: "created_at", header: "Uploaded at" },
    ],
  });

  const uploadToStorageSteam = new PassThrough();

  const convertToCsvPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk);
        }
        callback();
      },
    }),
    csv,
    uploadToStorageSteam,
  );

  const uploadToStorage = uploadFileToStorage({
    contentType: "text/csv",
    folder: "downloads",
    fileName: `${new Date().toISOString()}-uploads.csv`,
    contentStream: uploadToStorageSteam,
  });

  const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline]);
  await convertToCsvPipeline;

  return makeRight({ reportUrl: url });
}
