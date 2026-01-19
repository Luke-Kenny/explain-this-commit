import { describe, expect, test } from "vitest";
import { getTouchedAreas } from "../areaClassifier";
import type { DiffStats } from "../diffStats";

describe("getTouchedAreas", () => {
  test("classifies common paths into areas", () => {
    const diffStats: DiffStats = {
      filesChanged: 3,
      additions: 1,
      deletions: 1,
      filePaths: [
        "src/auth/session.ts",
        "package.json",
        "prisma/migrations/20260101_init/migration.sql",
      ],
    };

    const areas = getTouchedAreas(diffStats);

    expect(areas).toContain("auth/session");
    expect(areas).toContain("dependencies");
    expect(areas).toContain("database/migrations");
  });

  test("returns unique areas in stable order", () => {
    const diffStats: DiffStats = {
      filesChanged: 2,
      additions: 0,
      deletions: 0,
      filePaths: ["src/auth/a.ts", "src/auth/b.ts"],
    };

    const areas = getTouchedAreas(diffStats);
    expect(areas).toEqual(["auth/session"]);
  });
});
