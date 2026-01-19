import type { Area } from "./areaClassifier";

export type RiskLevel = "low" | "medium" | "high";

export type RiskSignal = {
  area: Area;
  level: RiskLevel;
  message: string;
};
