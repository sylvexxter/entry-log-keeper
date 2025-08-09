-- Ensure RLS is enabled on the submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing INSERT policies on public.submissions
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'submissions' AND cmd = 'insert'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.submissions', pol.policyname);
  END LOOP;
END
$$;

-- Allow INSERTs only for users authenticated via Google provider
CREATE POLICY "Only Google-authenticated users can insert"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'provider') = 'google');

-- Ensure public can read submissions (keep table visible to everyone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'submissions'
      AND policyname = 'Public can view submissions'
      AND cmd = 'select'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view submissions" ON public.submissions FOR SELECT USING (true)';
  END IF;
END
$$;