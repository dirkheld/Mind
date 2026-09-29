import { z } from "zod";
export const resourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  citation: z.string().trim().max(2000),
  url: z.union([z.literal(""), z.string().url().refine(value => ["http:", "https:"].includes(new URL(value).protocol))]),
  content: z.string().trim().min(1).max(20000),
  notes: z.string().trim().max(4000),
  enabled: z.boolean(),
}).strict();
export const knowledgeSchema = z.object({
  systemPrompt: z.string().trim().min(20).max(30000),
  resources: z.array(resourceSchema).max(30),
}).strict().refine(value => new Set(value.resources.map(item => item.id)).size === value.resources.length, "Quellen-IDs müssen eindeutig sein.");
export type Knowledge = z.infer<typeof knowledgeSchema>;
export const mutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), expectedVersion: z.number().int().positive(), draft: knowledgeSchema }).strict(),
  z.object({ action: z.literal("publish"), expectedVersion: z.number().int().positive() }).strict(),
]);
