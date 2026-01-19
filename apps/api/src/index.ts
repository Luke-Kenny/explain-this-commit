import express, { type Request, type Response } from "express";
import cors from "cors";
import { explainRouter } from "./routes/explain";

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// routes
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", explainRouter);

// server
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
