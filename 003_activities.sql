-- Create Activities table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
        CREATE TABLE activities (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
            name text NOT NULL,
            description text,
            activity_date date NOT NULL,
            start_time time,
            end_time time,
            location text,
            created_at timestamp with time zone DEFAULT now()
        );
    END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
