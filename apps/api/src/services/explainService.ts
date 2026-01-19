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
  // deterministic analysis
  const diffStats = getDiffStats(diff);
  const areas = getTouchedAreas(diffStats).filter((a) => a !== "other");
  const areaText = areas.length ? areas.slice(0, 3).join(", ") : "misc changes";

  const allRisks = getRisks(diffStats);
  const allChecklist = getReviewChecklist(diffStats);

  const isSenior = audience === "senior";

  // for seniors: dropping the low-signal "no tests changed" risk unless it's the only thing
  const filteredRisks = isSenior
    ? allRisks.filter((r) => !r.toLowerCase().includes("no test files changed"))
    : allRisks;

  // for seniors: keeping only the highest-signal few risks
  const risks = isSenior ? filteredRisks.slice(0, 3) : filteredRisks;

  // for seniors: keeping the top checklist items (signal > completeness)
  const reviewChecklist = isSenior ? allChecklist.slice(0, 4) : allChecklist;

  const summary = isSenior
    ? [
        `${diffStats.filesChanged} file(s) changed (+${diffStats.additions} / -${diffStats.deletions}); areas: ${areaText}.`,
        risks.length ? `Key risks: ${risks.slice(0, 2).join(" | ")}` : "No major risks detected by heuristics.",
      ]
    : [
        `Changed ${diffStats.filesChanged} file(s) (+${diffStats.additions} / -${diffStats.deletions}).`,
        `Touched areas: ${areaText}.`,
        `Audience: ${audience}`,
      ];

  const response: ExplainResponse = {
    diffStats,
    summary,
    risks,
    assumptions: [
      "No repository context provided; explanation is based only on the diff.",
    ],
    reviewChecklist,
  };

  // safety check
  const parsed = ExplainResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error("Invalid ExplainResponse produced by explainDiff");
  }

  return parsed.data;
}

