import { Router, type Request, type Response } from "express";
import { ExplainRequestSchema } from "@explain-this-commit/shared";
import { explainDiff } from "../services/explainService";

export const explainRouter = Router();

explainRouter.post("/explain", (req: Request, res: Response) => {
  const parsedReq = ExplainRequestSchema.safeParse(req.body);

  if (!parsedReq.success) {
    return res.status(400).json({
      error: "Invalid request body",
      issues: parsedReq.error.issues,
    });
  }

  const { diff, audience } = parsedReq.data;

  try {
    const response = explainDiff(diff, audience);
    return res.json(response);
  } catch {
    return res.status(500).json({
      error: "Server failed to generate a valid explanation",
    });
  }
});
