import type { DiffStats } from "./diffStats";
import type { RiskSignal } from "./riskModel";
import type { Area } from "./areaClassifier";

function pathMatchesAny(path: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(path));
}

function pushRisk(risks: RiskSignal[], area: Area, level: RiskSignal["level"], message: string) {
  // de-dup by area + message
  if (risks.some((r) => r.area === area && r.message === message)) return;
  risks.push({ area, level, message });
}

export function getRiskSignals(diffStats: DiffStats): RiskSignal[] {
  const risks: RiskSignal[] = [];
  const paths = diffStats.filePaths;

  const touchesAuth = paths.some((p) =>
    pathMatchesAny(p, [/auth/i, /login/i, /jwt/i, /token/i, /session/i])
  );
  if (touchesAuth) {
    pushRisk(
      risks,
      "auth/session",
      "high",
      "Authentication/session logic changed — review for security, expiry, and edge cases."
    );
  }

  const touchesDbOrMigration = paths.some((p) =>
    pathMatchesAny(p, [/migration/i, /migrate/i, /schema/i, /prisma/i, /typeorm/i, /sequelize/i, /db/i])
  );
  if (touchesDbOrMigration) {
    pushRisk(
      risks,
      "database/migrations",
      "high",
      "Database/schema/migration changes — review data integrity and rollback strategy."
    );
  }

  const touchesDeps = paths.some((p) =>
    pathMatchesAny(p, [
      /package\.json$/i,
      /pnpm-lock\.yaml$/i,
      /yarn\.lock$/i,
      /package-lock\.json$/i,
      /requirements\.txt$/i,
    ])
  );
  if (touchesDeps) {
    pushRisk(
      risks,
      "dependencies",
      "medium",
      "Dependency changes detected — check for breaking changes and run a full test pass."
    );
  }

  const touchesConfig = paths.some((p) =>
    pathMatchesAny(p, [/\.(env|yaml|yml|toml|ini)$/i, /config/i, /dockerfile/i, /docker-compose/i, /k8s/i])
  );
  if (touchesConfig) {
    pushRisk(
      risks,
      "config/infra",
      "medium",
      "Config/infrastructure files changed — verify deployment/runtime settings."
    );
  }

  const touchesTests = paths.some((p) =>
    pathMatchesAny(p, [/test/i, /spec/i, /__tests__/i, /cypress/i, /playwright/i])
  );
  if (!touchesTests) {
    pushRisk(
      risks,
      "tests",
      "low",
      "No test files changed — confirm coverage still matches the change scope."
    );
  }

  // Size-based heuristics
  const totalChanged = diffStats.additions + diffStats.deletions;

  if (diffStats.filesChanged >= 10) {
    pushRisk(
      risks,
      "other",
      "medium",
      "Large change set (10+ files) — consider splitting for easier review."
    );
  }

  if (totalChanged >= 200) {
    pushRisk(
      risks,
      "other",
      "medium",
      "High churn (200+ line changes) — review carefully for unintended behavior changes."
    );
  }

  if (diffStats.deletions >= 100) {
    pushRisk(
      risks,
      "other",
      "medium",
      "Significant deletions — ensure functionality wasn’t removed unintentionally."
    );
  }

  return risks;
}
