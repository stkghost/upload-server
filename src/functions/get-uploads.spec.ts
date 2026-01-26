import { describe, expect, it } from "vitest";

import { isRight, unwrapEither } from "@/shared/either";
import { randomUUID } from "node:crypto";
import { getUploads } from "./get-uploads";
import { makeUpload } from "@/test/factories/make-uploads";
import dayjs from "dayjs";

describe("list uploads", () => {
  it("should be able to list uploads ", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({ name: `${namePattern}.webp` });
    const upload2 = await makeUpload({ name: `${namePattern}.webp` });
    const upload3 = await makeUpload({ name: `${namePattern}.webp` });
    const upload4 = await makeUpload({ name: `${namePattern}.webp` });
    const upload5 = await makeUpload({ name: `${namePattern}.webp` });

    //sut = System under test
    const sut = await getUploads({
      searchQuery: namePattern,
    });
    const unwrappedSut = unwrapEither(sut);

    expect(isRight(sut)).toBe(true);
    expect(unwrappedSut.total).toEqual(5);
    expect(unwrappedSut.uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });

  it("should be able to list paginated uploads", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({ name: `${namePattern}.webp` });
    const upload2 = await makeUpload({ name: `${namePattern}.webp` });
    const upload3 = await makeUpload({ name: `${namePattern}.webp` });
    const upload4 = await makeUpload({ name: `${namePattern}.webp` });
    const upload5 = await makeUpload({ name: `${namePattern}.webp` });

    //sut = System under test
    let sut = await getUploads({
      searchQuery: namePattern,
      page: 1,
      pageSize: 3,
    });
    let unwrappedSut = unwrapEither(sut);

    expect(isRight(sut)).toBe(true);
    expect(unwrappedSut.total).toEqual(5);
    expect(unwrappedSut.uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
    ]);

    //sut = System under test
    sut = await getUploads({
      searchQuery: namePattern,
      page: 2,
      pageSize: 3,
    });
    unwrappedSut = unwrapEither(sut);

    expect(isRight(sut)).toBe(true);
    expect(unwrappedSut.total).toEqual(5);
    expect(unwrappedSut.uploads).toEqual([
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });

  it("should be able to list sorted uploads  ", async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: new Date(),
    });
    const upload2 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(1, "days").toDate(),
    });
    const upload3 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(2, "days").toDate(),
    });
    const upload4 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(3, "days").toDate(),
    });
    const upload5 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(4, "days").toDate(),
    });

    //sut = System under test
    let sut = await getUploads({
      searchQuery: namePattern,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    let unwrappedSut = unwrapEither(sut);

    expect(isRight(sut)).toBe(true);
    expect(unwrappedSut.total).toEqual(5);
    expect(unwrappedSut.uploads).toEqual([
      expect.objectContaining({ id: upload1.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload5.id }),
    ]);

    sut = await getUploads({
      searchQuery: namePattern,
      sortBy: "createdAt",
      sortDirection: "asc",
    });
    unwrappedSut = unwrapEither(sut);

    expect(isRight(sut)).toBe(true);
    expect(unwrappedSut.total).toEqual(5);
    expect(unwrappedSut.uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });
});
