import {
  ExplainResponseSchema,
  type ExplainResponse,
} from "@explain-this-commit/shared";

import { getDiffStats } from "./diffStats";
import { getRisks } from "./riskHeuristics";
import { getReviewChecklist } from "./checklistHeuristics";
import { getTouchedAreas } from "./areaClassifier";

export function explainDiff(
  diff: string,
  audience: "junior" | "senior"
): ExplainResponse {
  const diffStats = getDiffStats(diff);
  const risks = getRisks(diffStats);
  const reviewChecklist = getReviewChecklist(diffStats);
  
  const areas = getTouchedAreas(diffStats).filter((a) => a !== "other");
  const areaText = areas.length ? areas.slice(0, 3).join(", ") : "misc changes";

  const response: ExplainResponse = {
    diffStats,
    summary: [
      `Changed ${diffStats.filesChanged} file(s) (+${diffStats.additions} / -${diffStats.deletions}).`,
      `Touched areas: ${areaText}.`,
      `Audience: ${audience}`,
    ],
    risks,
    assumptions: [
      "No repository context provided; explanation is based only on the diff.",
    ],
    reviewChecklist,
  };

  // 4) Contract-first safety check
  const parsed = ExplainResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error("Invalid ExplainResponse produced by explainDiff");
  }

  return parsed.data;
}
