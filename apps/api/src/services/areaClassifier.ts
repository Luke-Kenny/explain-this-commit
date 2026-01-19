import type { DiffStats } from "./diffStats";

export type Area =
  | "auth/session"
  | "dependencies"
  | "database/migrations"
  | "config/infra"
  | "tests"
  | "ui"
  | "other";

function areaFromPath(path: string): Area {
  const p = path.toLowerCase();

  if (/(auth|login|jwt|token|session)/.test(p)) return "auth/session";
  if (/(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|requirements\.txt)/.test(p))
    return "dependencies";
  if (/(migration|migrate|schema|prisma|typeorm|sequelize|db)/.test(p)) return "database/migrations";
  if (/(config|docker|k8s|helm|\.env|\.ya?ml|\.toml|\.ini)/.test(p)) return "config/infra";
  if (/(test|spec|__tests__|cypress|playwright)/.test(p)) return "tests";
  if (/(ui|components|pages|styles|css|scss|tsx)$/.test(p)) return "ui";

  return "other";
}

export function getTouchedAreas(diffStats: DiffStats): Area[] {
  const areas = diffStats.filePaths.map(areaFromPath);
  // unique, stable order
  return Array.from(new Set(areas));
}
