-- MIND uses server-side Auth.js authorization, not the public Supabase Data API.
-- RLS denies access to roles without policies; the trusted backend uses its own role.
DO $$
DECLARE
  table_name text;
  api_role text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users', 'accounts', 'sessions', 'verification_tokens', 'profiles',
    'user_preferences', 'rate_limit_buckets', 'knowledge_workspaces',
    'knowledge_releases', 'usage_summaries', 'payments', 'payment_cards',
    'consent_events', '_prisma_migrations'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', table_name, api_role);
      END IF;
    END LOOP;
  END LOOP;
END $$;
