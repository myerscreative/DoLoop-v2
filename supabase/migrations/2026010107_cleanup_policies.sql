-- CLEANUP: Remove duplicate policies
DROP POLICY IF EXISTS "enable_delete_for_owners" ON public.loops;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.loops;
DROP POLICY IF EXISTS "enable_select_for_owners" ON public.loops;
DROP POLICY IF EXISTS "enable_update_for_owners" ON public.loops;
DROP POLICY IF EXISTS "Users can manage their own loops" ON public.loops;

-- Keep only:
-- "Users can view their own loops" - SELECT
-- "Users can create their own loops" - INSERT  
-- "Users can update their own loops" - UPDATE
-- "Users can delete their own loops" - DELETE
