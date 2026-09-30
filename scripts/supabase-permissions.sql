-- Infrastructure privileges, separate from portable Prisma table migrations.
-- Run as postgres when provisioning MIND. No customer rows are changed.
BEGIN;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, mind_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE UPDATE, DELETE ON public.knowledge_releases, public.consent_events FROM mind_app;
ALTER ROLE mind_app SET statement_timeout = '15s';
ALTER ROLE mind_app SET idle_in_transaction_session_timeout = '15s';
COMMIT;
