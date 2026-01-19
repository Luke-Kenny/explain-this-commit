import fs from "node:fs";
import path from "node:path";
import { explainDiff } from "../services/explainService";
import { getTouchedAreas } from "../services/areaClassifier";

type Row = {
  sample: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  areas: string; // derived from summary line for now
  risksCount: number;
  highSignalRiskCount: number;
};

function listDiffFiles(samplesDir: string) {
  return fs
    .readdirSync(samplesDir)
    .filter((f) => f.endsWith(".diff"))
    .sort();
}


function isHighSignalRisk(risk: string) {
  const r = risk.toLowerCase();
  return (
    r.includes("authentication") ||
    r.includes("database") ||
    r.includes("migration") ||
    r.includes("config") ||
    r.includes("dependency")
  );
}

function main() {
  const samplesDir = path.resolve(__dirname, "../../samples");
  const files = listDiffFiles(samplesDir);

  if (files.length === 0) {
    console.error(`No .diff files found in: ${samplesDir}`);
    process.exit(1);
  }

  const rows: Row[] = files
    .map((file) => {
      const diff = fs.readFileSync(path.join(samplesDir, file), "utf8");

      // skips 0 KB files
      if (!diff.trim()) return null;

      const res = explainDiff(diff, "senior");

      return {
        sample: file,
        filesChanged: res.diffStats.filesChanged,
        additions: res.diffStats.additions,
        deletions: res.diffStats.deletions,
        areas: getTouchedAreas(res.diffStats).filter((a) => a !== "other").join(", "),
        risksCount: res.risks.length,
        highSignalRiskCount: res.risks.filter(isHighSignalRisk).length,
      };
    })
    .filter((r): r is Row => r !== null);

  console.table(rows);

  const totals = rows.reduce(
    (acc, r) => {
      acc.filesChanged += r.filesChanged;
      acc.additions += r.additions;
      acc.deletions += r.deletions;
      acc.risksCount += r.risksCount;
      acc.highSignalRiskCount += r.highSignalRiskCount;
      return acc;
    },
    { filesChanged: 0, additions: 0, deletions: 0, risksCount: 0, highSignalRiskCount: 0 }
  );

  console.log("\nTotals:", totals);
}


main();
