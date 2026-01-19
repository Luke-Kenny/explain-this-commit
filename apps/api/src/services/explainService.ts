import {
  ExplainResponseSchema,
  type ExplainResponse,
} from "@explain-this-commit/shared";

import { getDiffStats } from "./diffStats";
import { getRiskSignals } from "./riskHeuristics";
import { getReviewChecklist } from "./checklistHeuristics";
import { getTouchedAreas } from "./areaClassifier";
import { getIntentSignals } from "./intentClassifier";

export function explainDiff(
  diff: string,
  audience: "junior" | "senior"
): ExplainResponse {
  // deterministic analysis
  const diffStats = getDiffStats(diff);
  const areas = getTouchedAreas(diffStats).filter((a) => a !== "other");
  const areaText = areas.length ? areas.slice(0, 3).join(", ") : "misc changes";

  const riskSignals = getRiskSignals(diffStats);
  const allRisks = riskSignals.map((r) => r.message);
  
  const allChecklist = getReviewChecklist(diffStats);
  const intents = getIntentSignals(diff, diffStats, riskSignals);

  const isSenior = audience === "senior";

  // for seniors: dropping the low-signal "no tests changed" risk unless it's the only thing
  const filteredRisks = isSenior
    ? allRisks.filter((r) => !r.toLowerCase().includes("no test files changed"))
    : allRisks;

  // for seniors: keeping only the highest-signal few risks
  const risks = isSenior ? filteredRisks.slice(0, 3) : filteredRisks;

  // for seniors: keeping the top checklist items (signal > completeness)
  const reviewChecklist = isSenior ? allChecklist.slice(0, 4) : allChecklist;

  const topIntent = intents[0];

  const intentText =
  topIntent.intent === "unknown"
    ? "unclear from diff alone"
    : `${topIntent.intent.split("_").join(" ")} (${topIntent.confidence})`;

  const summary = isSenior
    ? [
        `${diffStats.filesChanged} file(s) changed (+${diffStats.additions} / -${diffStats.deletions}); areas: ${areaText}.`,
        `Intent: ${intentText}.`,
        ]
    : [
        `Changed ${diffStats.filesChanged} file(s) (+${diffStats.additions} / -${diffStats.deletions}).`,
        `Touched areas: ${areaText}.`,
        `Likely intent: ${intentText}.`,
        `Rationale: ${topIntent.rationale}`,
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

