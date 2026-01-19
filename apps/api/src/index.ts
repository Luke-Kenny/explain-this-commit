import express, { type Request, type Response } from "express";
import cors from "cors";

import {
  ExplainRequestSchema,
  ExplainResponseSchema,
  type ExplainResponse,
} from "@explain-this-commit/shared";

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// routes
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.post("/api/explain", (req: Request, res: Response) => {
  const parsedReq = ExplainRequestSchema.safeParse(req.body);
  if (!parsedReq.success) {
    return res.status(400).json({
      error: "Invalid request body",
      issues: parsedReq.error.issues,
    });
  }

  const { diff, audience } = parsedReq.data;

  const response: ExplainResponse = {
    summary: [
      `Received diff with ${diff.length} characters`,
      `Audience: ${audience}`,
    ],
    risks: [],
    assumptions: [
      "No repository context provided; explanation is based only on the diff.",
    ],
    reviewChecklist: [
      "Confirm intent matches the change",
      "Check edge cases and error handling",
      "Run relevant tests locally/CI",
    ],
  };

  const parsedRes = ExplainResponseSchema.safeParse(response);
  if (!parsedRes.success) {
    return res.status(500).json({
      error: "Server produced invalid response shape",
    });
  }

  return res.json(parsedRes.data);
});

// server
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
