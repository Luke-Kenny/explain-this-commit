import {
  ExplainResponseSchema,
  type ExplainResponse,
} from "@explain-this-commit/shared";

import { getDiffStats } from "./diffStats";

export function explainDiff(
  diff: string,
  audience: "junior" | "senior"
): ExplainResponse {
  const diffStats = getDiffStats(diff);

  const response: ExplainResponse = {
    diffStats,
    summary: [
      `Changed ${diffStats.filesChanged} file(s) (+${diffStats.additions} / -${diffStats.deletions})`,
      `Audience: ${audience}`,
    ],
    risks: [],
    assumptions: [
      "No repository context provided; explanation is based only on the diff.",
    ],
    reviewChecklist: [
      "Confirm intent matches the change",
      "Check edge cases and error handling",
      "Run relevant tests locally/CI",
    ],
  };

  const parsed = ExplainResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error("Invalid ExplainResponse produced by explainDiff");
  }

  return parsed.data;
}
