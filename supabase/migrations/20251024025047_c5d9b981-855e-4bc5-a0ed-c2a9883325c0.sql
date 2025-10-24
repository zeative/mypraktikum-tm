-- Drop the problematic policy
DROP POLICY IF EXISTS "Guru can view all profiles" ON public.profiles;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.check_user_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Guru can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.check_user_role(auth.uid(), 'GURU'));

-- Also update the reports policies to use the same function
DROP POLICY IF EXISTS "Guru can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Guru can update all reports" ON public.reports;

CREATE POLICY "Guru can view all reports"
  ON public.reports FOR SELECT
  USING (public.check_user_role(auth.uid(), 'GURU'));

CREATE POLICY "Guru can update all reports"
  ON public.reports FOR UPDATE
  USING (public.check_user_role(auth.uid(), 'GURU'));