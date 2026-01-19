export type DiffStats = {
  filesChanged: number;
  additions: number;
  deletions: number;
  filePaths: string[];
};
// todo: re-do comments
export function getDiffStats(diff: string): DiffStats {
  const filePaths: string[] = [];
  let additions = 0;
  let deletions = 0;

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      const parts = line.split(" ");
      const bPath = parts[3]; // usually "b/<path>"
      if (bPath && bPath.startsWith("b/")) {
        filePaths.push(bPath.slice(2));
      }
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) additions++;
    if (line.startsWith("-") && !line.startsWith("---")) deletions++;
  }

  return {
    filesChanged: filePaths.length,
    additions,
    deletions,
    filePaths,
  };
}
