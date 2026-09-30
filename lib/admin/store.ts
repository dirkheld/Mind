import "server-only";
import { db } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { initialKnowledge } from "./defaults";
import { knowledgeSchema, type Knowledge } from "./schema";
export async function getKnowledgeWorkspace(workspaceId = "main") {
  const workspace = await db.knowledgeWorkspace.upsert({ where: { id: workspaceId }, create: { id: workspaceId, draft: initialKnowledge }, update: {} });
  const releases = await db.knowledgeRelease.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, version: true, createdAt: true } });
  return { draft: knowledgeSchema.parse(workspace.draft), version: workspace.version, activeReleaseId: workspace.activeReleaseId, updatedAt: workspace.updatedAt.toISOString(), releases: releases.map(item => ({ ...item, createdAt: item.createdAt.toISOString() })) };
}
export async function saveKnowledge(draft: Knowledge, expectedVersion: number, workspaceId = "main") {
  const content = knowledgeSchema.parse(draft);
  const changed = await db.knowledgeWorkspace.updateMany({ where: { id: workspaceId, version: expectedVersion }, data: { draft: content, version: { increment: 1 } } });
  if (!changed.count) throw new AppError("CONFLICT", "Der Entwurf wurde inzwischen geändert. Lade den aktuellen Stand neu, bevor du speicherst.", 409);
}
export async function publishKnowledge(expectedVersion: number, userId: string, workspaceId = "main") {
  await db.$transaction(async tx => {
    // Acquire the draft version before reading it; concurrent saves/publications cannot slip in.
    const changed = await tx.knowledgeWorkspace.updateMany({ where: { id: workspaceId, version: expectedVersion }, data: { version: { increment: 1 } } });
    if (!changed.count) throw new AppError("CONFLICT", "Der Entwurf wurde inzwischen geändert. Bitte lade den aktuellen Stand neu.", 409);
    const workspace = await tx.knowledgeWorkspace.findUniqueOrThrow({ where: { id: workspaceId } });
    const content = knowledgeSchema.parse(workspace.draft);
    const release = await tx.knowledgeRelease.create({ data: { workspaceId, version: expectedVersion, content, createdBy: userId } });
    await tx.knowledgeWorkspace.update({ where: { id: workspaceId }, data: { activeReleaseId: release.id } });
  });
}

// Server-side boundary for the later conversation service. Never load the draft there.
export async function getPublishedKnowledge(workspaceId = "main") {
  const workspace = await db.knowledgeWorkspace.findUnique({ where: { id: workspaceId } });
  if (!workspace?.activeReleaseId) return null;
  const release = await db.knowledgeRelease.findUniqueOrThrow({ where: { id: workspace.activeReleaseId } });
  const content = knowledgeSchema.parse(release.content);
  return { releaseId: release.id, systemPrompt: content.systemPrompt, resources: content.resources.filter(item => item.enabled) };
}
