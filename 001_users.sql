-- 1️⃣ Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- 2️⃣ Create or replace moddatetime() function
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    website text,
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 4️⃣ Drop and recreate trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp ON public.profiles;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION moddatetime();

-- 5️⃣ Create auth.users table if needed
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    encrypted_password text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 6️⃣ Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_id_fkey'
          AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
        REFERENCES auth.users (id) ON DELETE CASCADE;
    END IF;
END
$$;
