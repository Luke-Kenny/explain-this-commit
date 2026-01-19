import { describe, expect, test } from "vitest";
import { getDiffStats } from "../diffStats";

describe("getDiffStats", () => {
  test("extracts file paths and counts additions/deletions", () => {
    const diff = [
      "diff --git a/src/auth.ts b/src/auth.ts",
      "--- a/src/auth.ts",
      "+++ b/src/auth.ts",
      "+hello",
      "-world",
      "diff --git a/package.json b/package.json",
      "+dep",
      "-old",
    ].join("\n");

    const stats = getDiffStats(diff);

    expect(stats.filesChanged).toBe(2);
    expect(stats.filePaths).toEqual(["src/auth.ts", "package.json"]);
    expect(stats.additions).toBe(2); // +hello, +dep (ignores +++)
    expect(stats.deletions).toBe(2); // -world, -old (ignores ---)
  });

  test("handles empty diff", () => {
    const stats = getDiffStats("");
    expect(stats.filesChanged).toBe(0);
    expect(stats.filePaths).toEqual([]);
    expect(stats.additions).toBe(0);
    expect(stats.deletions).toBe(0);
  });
});
