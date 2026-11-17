-- Run this complete script in the existing Supabase project's SQL Editor.
-- Adds likes and moderated comments for blurbs. Raw tables stay private:
-- rishia.in reads and writes only through the functions below, and comments
-- stay pending until approved in the Comments tab of archive.rishia.in/admin,
-- which uses the server-side secret key.
BEGIN;

CREATE TABLE IF NOT EXISTS public.blurb_likes (
  slug text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, session_id)
);

CREATE TABLE IF NOT EXISTS public.blurb_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS blurb_comments_slug_status_idx ON public.blurb_comments (slug, status, created_at);

ALTER TABLE public.blurb_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blurb_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blurb_likes, public.blurb_comments FROM PUBLIC, anon, authenticated;
-- The archive admin reviews comments with the server-side secret key.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, UPDATE ON public.blurb_comments TO service_role;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.blurb_valid_slug(p_slug text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = ''
AS $function$ SELECT p_slug ~ '^[a-z0-9][a-z0-9-]{0,119}$' $function$;

-- Likes are deliberately unguarded beyond one row per browser session.
CREATE OR REPLACE FUNCTION public.set_blurb_like(p_slug text, p_session_id text, p_liked boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT public.blurb_valid_slug(p_slug) OR p_session_id !~ '^[A-Za-z0-9_-]{8,100}$' THEN
    RAISE EXCEPTION 'Invalid like';
  END IF;
  IF p_liked THEN
    INSERT INTO public.blurb_likes (slug, session_id) VALUES (p_slug, p_session_id) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.blurb_likes WHERE slug = p_slug AND session_id = p_session_id;
  END IF;
  RETURN (SELECT COUNT(*)::integer FROM public.blurb_likes WHERE slug = p_slug);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_blurb_engagement(p_slug text, p_session_id text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF NOT public.blurb_valid_slug(p_slug) THEN RAISE EXCEPTION 'Invalid slug'; END IF;
  RETURN pg_catalog.jsonb_build_object(
    'likes', (SELECT COUNT(*) FROM public.blurb_likes WHERE slug = p_slug),
    'liked', EXISTS (SELECT 1 FROM public.blurb_likes WHERE slug = p_slug AND session_id = p_session_id),
    'comments', COALESCE((
      SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id', c.id, 'name', c.name, 'body', c.body, 'createdAt', c.created_at) ORDER BY c.created_at)
      FROM public.blurb_comments c WHERE c.slug = p_slug AND c.status = 'approved'
    ), '[]'::jsonb)
  );
END;
$function$;

-- New comments wait for review. A loose ceiling on pending comments stops a
-- flood from burying real ones before they can be read.
CREATE OR REPLACE FUNCTION public.submit_blurb_comment(p_slug text, p_name text, p_body text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  clean_name text := pg_catalog.btrim(p_name);
  clean_body text := pg_catalog.btrim(p_body);
  new_id uuid;
BEGIN
  IF NOT public.blurb_valid_slug(p_slug)
     OR clean_name IS NULL OR pg_catalog.length(clean_name) NOT BETWEEN 1 AND 60
     OR clean_body IS NULL OR pg_catalog.length(clean_body) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Invalid comment';
  END IF;
  IF (SELECT COUNT(*) FROM public.blurb_comments
      WHERE status = 'pending' AND created_at > pg_catalog.now() - interval '1 hour') >= 50 THEN
    RAISE EXCEPTION 'Too many pending comments';
  END IF;
  INSERT INTO public.blurb_comments (slug, name, body) VALUES (p_slug, clean_name, clean_body) RETURNING id INTO new_id;
  RETURN new_id;
END;
$function$;

NOTIFY pgrst, 'reload schema';
COMMIT;
