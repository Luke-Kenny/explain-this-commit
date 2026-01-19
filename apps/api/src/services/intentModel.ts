export type Intent =
  | "security_hardening"
  | "performance_optimization"
  | "dependency_maintenance"
  | "test_coverage_improvement"
  | "config_alignment"
  | "refactor"
  | "unknown";

export type IntentSignal = {
  intent: Intent;
  confidence: "low" | "medium" | "high";
  rationale: string;
};
