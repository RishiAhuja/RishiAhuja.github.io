-- Run this complete script in the existing Supabase project's SQL Editor.
-- Original totals are backed up. Visit records and historical page views stay intact.
-- Public RPC signatures are unchanged; no raw analytics access is granted.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
LOCK TABLE public.visitor_analytics, public.daily_stats IN SHARE ROW EXCLUSIVE MODE;

-- Refuse to guess if records are missing or their daily totals do not reconcile.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.visitor_analytics
             WHERE session_id IS NULL OR btrim(session_id) = ''
                OR COALESCE(visited_at, created_at) IS NULL) THEN
    RAISE EXCEPTION 'Some visits lack a session or timestamp. No changes applied.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.daily_stats ds FULL JOIN (
      SELECT (COALESCE(visited_at, created_at) AT TIME ZONE 'UTC')::date AS date,
             COUNT(*) AS views
      FROM public.visitor_analytics GROUP BY 1
    ) recorded USING (date)
    WHERE COALESCE(ds.page_views, 0) <> COALESCE(recorded.views, 0)
  ) THEN
    RAISE EXCEPTION 'Daily totals do not match the visit records. No changes applied.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.daily_stats_before_session_fix_20261012
  (LIKE public.daily_stats INCLUDING ALL);
ALTER TABLE public.daily_stats_before_session_fix_20261012 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.daily_stats_before_session_fix_20261012 FROM PUBLIC, anon, authenticated;
INSERT INTO public.daily_stats_before_session_fix_20261012
  SELECT * FROM public.daily_stats ON CONFLICT (date) DO NOTHING;

CREATE INDEX IF NOT EXISTS visitor_analytics_session_visit_idx
  ON public.visitor_analytics (session_id, visited_at);

UPDATE public.daily_stats ds SET
  total_visitors = recorded.visitors,
  unique_sessions = recorded.visitors,
  updated_at = NOW()
FROM (
  SELECT (COALESCE(visited_at, created_at) AT TIME ZONE 'UTC')::date AS date,
         COUNT(DISTINCT session_id)::integer AS visitors
  FROM public.visitor_analytics GROUP BY 1
) recorded WHERE ds.date = recorded.date;

CREATE OR REPLACE FUNCTION public.log_visit(p_page_path text, p_session_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' SET timezone = 'UTC'
AS $function$
DECLARE
  visit_time timestamptz := pg_catalog.clock_timestamp();
  visit_date date := (visit_time AT TIME ZONE 'UTC')::date;
  is_new_daily_session boolean;
BEGIN
  IF p_session_id IS NULL OR pg_catalog.btrim(p_session_id) = ''
     OR pg_catalog.length(p_session_id) > 100
     OR p_page_path IS NULL OR pg_catalog.left(p_page_path, 1) <> '/'
     OR pg_catalog.length(p_page_path) > 200 THEN
    RAISE EXCEPTION 'Invalid visit';
  END IF;
  -- Serialize recordings for this session/day, including concurrent requests.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_session_id || ':' || visit_date::text, 0)
  );
  SELECT NOT EXISTS (
    SELECT 1 FROM public.visitor_analytics va
    WHERE va.session_id = p_session_id
      AND COALESCE(va.visited_at, va.created_at) >= visit_date::timestamptz
      AND COALESCE(va.visited_at, va.created_at) < (visit_date + 1)::timestamptz
  ) INTO is_new_daily_session;

  INSERT INTO public.visitor_analytics (page_path, session_id, visited_at, created_at)
  VALUES (p_page_path, p_session_id, visit_time, visit_time);
  INSERT INTO public.daily_stats (date, total_visitors, unique_sessions, page_views)
  VALUES (visit_date, is_new_daily_session::integer, is_new_daily_session::integer, 1)
  ON CONFLICT (date) DO UPDATE SET
    total_visitors = COALESCE(daily_stats.total_visitors, 0) + is_new_daily_session::integer,
    unique_sessions = COALESCE(daily_stats.unique_sessions, 0) + is_new_daily_session::integer,
    page_views = COALESCE(daily_stats.page_views, 0) + 1,
    updated_at = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_total_visitors()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (SELECT COUNT(DISTINCT session_id)::integer FROM public.visitor_analytics);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_daily_stats(days_back integer DEFAULT 30)
RETURNS TABLE(date date, visitors integer, page_views integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' SET timezone = 'UTC'
AS $function$
BEGIN
  RETURN QUERY
  SELECT ds.date, COALESCE(ds.unique_sessions, 0), COALESCE(ds.page_views, 0)
  FROM public.daily_stats ds
  WHERE ds.date >= CURRENT_DATE - LEAST(GREATEST(days_back, 1), 3650)
  ORDER BY ds.date DESC;
END;
$function$;

-- Transactional smoke check: test rows are rolled back before COMMIT.
DO $$
DECLARE
  marker text := 'migration_check_' || pg_catalog.pg_backend_pid()::text;
  day date := CURRENT_DATE;
  before_total integer := public.get_total_visitors();
  before_visitors integer := COALESCE((SELECT unique_sessions FROM public.daily_stats WHERE date = day), 0);
  before_views integer := COALESCE((SELECT page_views FROM public.daily_stats WHERE date = day), 0);
BEGIN
  BEGIN
    PERFORM public.log_visit('/stats-check', marker);
    PERFORM public.log_visit('/stats-check-second', marker);
    IF public.get_total_visitors() <> before_total + 1
       OR (SELECT unique_sessions FROM public.daily_stats WHERE date = day) <> before_visitors + 1
       OR (SELECT page_views FROM public.daily_stats WHERE date = day) <> before_views + 2 THEN
      RAISE EXCEPTION 'Session-count smoke check failed';
    END IF;
    RAISE EXCEPTION USING ERRCODE = 'ZX001', MESSAGE = 'Rollback test recordings';
  EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
  END;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;

SELECT public.get_total_visitors() AS recorded_sessions,
       public.get_total_visitors() + 5747 AS total_with_legacy,
       (SELECT SUM(page_views) FROM public.daily_stats) AS preserved_page_logs;
