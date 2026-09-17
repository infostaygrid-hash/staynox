-- SaaS Upgrade for StayNox

-- 1. Create Owners Table
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    subscription_status TEXT DEFAULT 'inactive', -- active, inactive, pending
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add owner_id to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE;

-- 3. Add is_active to properties (so unpaid owners' listings are hidden)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Enable RLS on owners
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- 5. Owners can read their own profile
CREATE POLICY "Owners can view own profile" 
ON public.owners FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Owners can update their own profile
CREATE POLICY "Owners can update own profile" 
ON public.owners FOR UPDATE 
USING (auth.uid() = user_id);

-- 7. Owners can insert their own profile
CREATE POLICY "Owners can insert own profile" 
ON public.owners FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Note: Properties RLS needs to be updated to allow owners to insert/update their own properties
-- (Assuming properties RLS is already enabled from earlier setup)
CREATE POLICY "Owners can insert their own properties" 
ON public.properties FOR INSERT 
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.owners WHERE id = owner_id)
);

CREATE POLICY "Owners can update their own properties" 
ON public.properties FOR UPDATE 
USING (
    auth.uid() IN (SELECT user_id FROM public.owners WHERE id = owner_id)
);
