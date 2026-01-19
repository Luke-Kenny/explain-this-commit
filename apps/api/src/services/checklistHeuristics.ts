import type { DiffStats } from "./diffStats";

function hasPath(paths: string[], re: RegExp) {
  return paths.some((p) => re.test(p));
}

export function getReviewChecklist(diffStats: DiffStats): string[] {
  const items: string[] = [];

  items.push("Confirm the change matches the intended behavior");
  items.push("Check for edge cases and error handling");
  items.push("Run relevant tests locally/CI");

  const paths = diffStats.filePaths;

  if (hasPath(paths, /auth|login|jwt|token|session/i)) {
    items.push("Verify auth flows (expiry, invalid tokens, logout/session invalidation)");
  }

  if (hasPath(paths, /migration|migrate|schema|prisma|typeorm|sequelize|db/i)) {
    items.push("Review migration safety (backups, rollback strategy, data integrity)");
  }

  if (
    hasPath(paths, /package\.json$/i) ||
    hasPath(paths, /pnpm-lock\.yaml$/i) ||
    hasPath(paths, /yarn\.lock$/i) ||
    hasPath(paths, /package-lock\.json$/i) ||
    hasPath(paths, /requirements\.txt$/i)
  ) {
    items.push("Check dependency changes for breaking updates; run a full test pass");
  }

  if (hasPath(paths, /\.(env|yaml|yml|toml|ini)$/i) || hasPath(paths, /config|docker|k8s/i)) {
    items.push("Validate configuration/runtime impact in your target environment");
  }

  const churn = diffStats.additions + diffStats.deletions;
  if (diffStats.filesChanged >= 10 || churn >= 200) {
    items.push("Consider splitting into smaller commits/PRs for safer review");
  }

  return Array.from(new Set(items));
}
