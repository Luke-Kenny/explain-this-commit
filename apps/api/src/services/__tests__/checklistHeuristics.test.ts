import { describe, expect, test } from "vitest";
import { getReviewChecklist } from "../checklistHeuristics";
import type { DiffStats } from "../diffStats";

describe("getReviewChecklist", () => {
  test("adds auth-specific checklist item for auth paths", () => {
    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 0,
      deletions: 0,
      filePaths: ["src/auth/session.ts"],
    };

    const items = getReviewChecklist(diffStats);
    expect(items.some((x) => x.toLowerCase().includes("auth flows"))).toBe(true);
  });

  test("adds dependency checklist item for package.json", () => {
    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 0,
      deletions: 0,
      filePaths: ["package.json"],
    };

    const items = getReviewChecklist(diffStats);
    expect(items.some((x) => x.toLowerCase().includes("dependency"))).toBe(true);
  });
});
