import type { DiffStats } from "./diffStats";

function pathMatchesAny(path: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(path));
}

export function getRisks(diffStats: DiffStats): string[] {
  const risks: string[] = [];

  const paths = diffStats.filePaths;

  const touchesAuth = paths.some((p) =>
    pathMatchesAny(p, [/auth/i, /login/i, /jwt/i, /token/i, /session/i])
  );
  if (touchesAuth) {
    risks.push("Authentication/session logic changed — review for security and edge cases.");
  }

  const touchesDbOrMigration = paths.some((p) =>
    pathMatchesAny(p, [/migration/i, /migrate/i, /schema/i, /prisma/i, /typeorm/i, /sequelize/i, /db/i])
  );
  if (touchesDbOrMigration) {
    risks.push("Database/schema/migration changes — review data integrity and rollback strategy.");
  }

  const touchesDeps = paths.some((p) =>
    pathMatchesAny(p, [/package\.json$/i, /pnpm-lock\.yaml$/i, /yarn\.lock$/i, /package-lock\.json$/i, /requirements\.txt$/i])
  );
  if (touchesDeps) {
    risks.push("Dependency changes detected — check for breaking changes and run a full test pass.");
  }

  const touchesConfig = paths.some((p) =>
    pathMatchesAny(p, [/\.(env|yaml|yml|toml|ini)$/i, /config/i, /dockerfile/i, /docker-compose/i, /k8s/i])
  );
  if (touchesConfig) {
    risks.push("Config/infrastructure files changed — verify deployment/runtime settings.");
  }

  const touchesTests = paths.some((p) =>
    pathMatchesAny(p, [/test/i, /spec/i, /__tests__/i, /cypress/i, /playwright/i])
  );
  if (!touchesTests) {
    risks.push("No test files changed — confirm coverage still matches the change scope.");
  }

  // size-based heuristics
  const totalChanged = diffStats.additions + diffStats.deletions;

  if (diffStats.filesChanged >= 10) {
    risks.push("Large change set (10+ files) — consider splitting for easier review.");
  }

  if (totalChanged >= 200) {
    risks.push("High churn (200+ line changes) — review carefully for unintended behavior changes.");
  }

  if (diffStats.deletions >= 100) {
    risks.push("Significant deletions — ensure functionality wasn’t removed unintentionally.");
  }

  // de-dup in case multiple rules add similar things
  return Array.from(new Set(risks));
}
