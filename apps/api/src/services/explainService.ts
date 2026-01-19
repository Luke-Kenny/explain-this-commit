import {
  ExplainResponseSchema,
  type ExplainResponse,
} from "@explain-this-commit/shared";

export function explainDiff(
  diff: string,
  audience: "junior" | "senior"
): ExplainResponse {
  const response: ExplainResponse = {
    summary: [
      `Received diff with ${diff.length} characters`,
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
    throw new Error("Invalid ExplainResponse produced");
  }

  return parsed.data;
}
