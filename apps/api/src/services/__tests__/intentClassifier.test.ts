import { describe, expect, test } from "vitest";
import { getIntentSignals } from "../intentClassifier";
import type { DiffStats } from "../diffStats";
import type { RiskSignal } from "../riskModel";

describe("getIntentSignals", () => {
  test("infers security_hardening from auth + token hints", () => {
    const diff =
      "diff --git a/src/auth/token.ts b/src/auth/token.ts\n+JWT_SECRETS\n+expiresIn: \"15m\"";

    const diffStats: DiffStats = {
      filesChanged: 1,
      additions: 2,
      deletions: 0,
      filePaths: ["src/auth/token.ts"],
    };

    const risks: RiskSignal[] = [
      { area: "auth/session", level: "high", message: "Auth changed" },
    ];

    const intents = getIntentSignals(diff, diffStats, risks);

    expect(intents[0].intent).toBe("security_hardening");
    expect(intents[0].confidence).toBe("high");
  });
});
