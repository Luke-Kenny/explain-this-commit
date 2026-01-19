import { z } from "zod";

/**
 *  input from frontend from the api
 */
export const ExplainRequestSchema = z.object({
    diff: z.string().min(1, "Diff cant be empty"),
    audience: z.enum(["junior", "senior"]),
});

export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;


/**
 * structured explanation returned to the api
 */
export const ExplainResponseSchema = z.object({
    summary: z.array(z.string()),
    risks: z.array(z.string()),
    assumptions: z.array(z.string()),
    reviewChecklist: z.array(z.string()),
});

export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;

