import type { DiffStats } from "./diffStats";
import type { RiskSignal } from "./riskModel";
import type { IntentSignal } from "./intentModel";

function includesAny(haystack: string, needles: string[]) {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

export function getIntentSignals(diff: string, diffStats: DiffStats, risks: RiskSignal[]): IntentSignal[] {
  const signals: IntentSignal[] = [];

  const paths = diffStats.filePaths.map((p) => p.toLowerCase());
  const text = diff.toLowerCase();

  const touchedDeps = paths.some((p) => p.endsWith("package.json") || p.includes("lock"));
  const touchedTests = paths.some((p) => p.includes("test") || p.includes("__tests__") || p.includes("spec"));

  const hasAuthHighRisk = risks.some((r) => r.area === "auth/session" && r.level === "high");
  const hasDbHighRisk = risks.some((r) => r.area === "database/migrations" && r.level === "high");

  // security hardening: auth changes + token/secret/expiry hints
  if (
    hasAuthHighRisk &&
    includesAny(text, ["jwt", "token", "secret", "expiry", "expires", "ttl", "rotate"])
  ) {
    signals.push({
      intent: "security_hardening",
      confidence: "high",
      rationale: "Auth/token-related changes suggest improving security (rotation/expiry/validation).",
    });
  }

  // performance optimization: migrations/index hints
  if (hasDbHighRisk && includesAny(text, ["index", "concurrently", "optimize", "performance"])) {
    signals.push({
      intent: "performance_optimization",
      confidence: "medium",
      rationale: "Database migration mentions index/performance-related changes.",
    });
  }

  // dependency maintenance
  if (touchedDeps) {
    signals.push({
      intent: "dependency_maintenance",
      confidence: "medium",
      rationale: "Dependency manifest/lockfile changed.",
    });
  }

  // test coverage improvement
  if (touchedTests && includesAny(text, ["test(", "describe(", "it("])) {
    signals.push({
      intent: "test_coverage_improvement",
      confidence: "medium",
      rationale: "New/updated tests suggest improving coverage or preventing regressions.",
    });
  }

  // config alignment
  if (paths.some((p) => includesAny(p, ["config", ".env", "docker", "compose", "k8s", "helm"]))) {
    signals.push({
      intent: "config_alignment",
      confidence: "low",
      rationale: "Config/infra files changed; could be aligning runtime settings.",
    });
  }

  if (signals.length === 0) {
    signals.push({
      intent: "unknown",
      confidence: "low",
      rationale: "No clear intent inferred from diff structure and risk signals.",
    });
  }

  const seen = new Set<string>();
  return signals.filter((s) => (seen.has(s.intent) ? false : (seen.add(s.intent), true)));
}
