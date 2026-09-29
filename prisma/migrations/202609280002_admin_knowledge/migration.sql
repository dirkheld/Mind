CREATE TABLE "knowledge_workspaces" (
  "id" TEXT NOT NULL,
  "draft" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "activeReleaseId" UUID,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "knowledge_workspaces_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "knowledge_releases" (
  "id" UUID NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "createdBy" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "knowledge_releases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "knowledge_releases_workspaceId_version_key" ON "knowledge_releases"("workspaceId", "version");
