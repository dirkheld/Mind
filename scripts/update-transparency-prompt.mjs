import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { transparentGuidance } from "../lib/admin/transparent-guidance.ts";
const db = new PrismaClient();
try {
  const workspace = await db.knowledgeWorkspace.findUnique({ where: { id: "main" } });
  if (!workspace) throw new Error("Kein Adminentwurf vorhanden.");
  const draft = workspace.draft;
  if (!draft || typeof draft.systemPrompt !== "string") throw new Error("Ungültiger Entwurf.");
  if (draft.systemPrompt.includes(transparentGuidance)) {
    console.log("Gesprächsregel bereits im Entwurf enthalten.");
  } else {
    const systemPrompt = `${draft.systemPrompt}\n\n${transparentGuidance}`;
    if (systemPrompt.length > 30000) throw new Error("Prompt würde die maximale Länge überschreiten.");
    const result = await db.knowledgeWorkspace.updateMany({ where: { id: "main", version: workspace.version }, data: { draft: { ...draft, systemPrompt }, version: { increment: 1 } } });
    if (!result.count) throw new Error("Entwurf wurde parallel geändert; bitte erneut ausführen.");
    console.log("Gesprächsregel im Adminentwurf ergänzt. Quellen und Freigaben bleiben erhalten.");
  }
} finally { await db.$disconnect(); }
