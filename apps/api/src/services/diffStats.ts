export type DiffStats = {
  filesChanged: number;
  additions: number;
  deletions: number;
  filePaths: string[];
};

export function getDiffStats(diff: string): DiffStats {
  const filePaths: string[] = [];
  let additions = 0;
  let deletions = 0;

  for (const line of diff.split(/\r?\n/)) {
    // Detect file headers: diff --git a/path b/path
    if (line.startsWith("diff --git ")) {
      const parts = line.split(" ");
      const bPath = parts[3]; // usually "b/<path>"
      if (bPath && bPath.startsWith("b/")) {
        filePaths.push(bPath.slice(2));
      }
      continue;
    }

    // Count additions/deletions, but ignore the file marker lines +++/---
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
