-- ============================================
-- Migration: Create Cities and Trips Tables
-- Safe for re-run (idempotent)
-- ============================================

-- Create Cities table if it doesn't exist
CREATE TABLE IF NOT EXISTS cities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    country text NOT NULL,
    latitude decimal(9,6),
    longitude decimal(9,6),
    description text,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Trips table if it doesn't exist
CREATE TABLE IF NOT EXISTS trips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cities'
    ) THEN
        RAISE NOTICE 'Table cities does not exist, skipping RLS.';
    ELSE
        EXECUTE 'ALTER TABLE cities ENABLE ROW LEVEL SECURITY';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trips'
    ) THEN
        RAISE NOTICE 'Table trips does not exist, skipping RLS.';
    ELSE
        EXECUTE 'ALTER TABLE trips ENABLE ROW LEVEL SECURITY';
    END IF;
END
$$;
