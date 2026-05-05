-- Dashboard-only delete for public.rental_packages (bypasses RLS when needed).

CREATE OR REPLACE FUNCTION public.delete_rental_package_dashboard(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rental_packages
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_rental_package_dashboard(uuid) TO authenticated;
