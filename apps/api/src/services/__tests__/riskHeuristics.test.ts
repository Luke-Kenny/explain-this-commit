import { describe, expect, test } from "vitest";
import { getRiskSignals } from "../riskHeuristics";
import type { DiffStats } from "../diffStats";

describe("getRiskSignals", () => {
  test("flags auth/session changes as high risk", () => {
    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 1,
      deletions: 0,
      filePaths: ["src/auth/session.ts"],
    };

    const risks = getRiskSignals(diffStats);

    expect(
      risks.some(
        (r) => r.area === "auth/session" && r.level === "high"
      )
    ).toBe(true);
  });

  test("flags dependency changes as medium risk", () => {
    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 1,
      deletions: 1,
      filePaths: ["package.json"],
    };

    const risks = getRiskSignals(diffStats);

    expect(
      risks.some(
        (r) => r.area === "dependencies" && r.level === "medium"
      )
    ).toBe(true);
  });

  test("flags missing tests as low risk", () => {
    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 1,
      deletions: 1,
      filePaths: ["src/core/logic.ts"],
    };

    const risks = getRiskSignals(diffStats);

    expect(
      risks.some(
        (r) =>
          r.area === "tests" &&
          r.level === "low" &&
          r.message.toLowerCase().includes("no test")
      )
    ).toBe(true);
  });
});
