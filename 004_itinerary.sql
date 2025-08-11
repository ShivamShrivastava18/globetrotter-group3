-- Create Itinerary table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'itinerary'
    ) THEN
        CREATE TABLE itinerary (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
            day_number integer NOT NULL,
            title text NOT NULL,
            description text,
            created_at timestamp with time zone DEFAULT now()
        );
    END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE itinerary ENABLE ROW LEVEL SECURITY;
