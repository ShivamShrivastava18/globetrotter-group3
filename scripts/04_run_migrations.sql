-- This file ensures all migrations are applied
-- Run this after the previous migration files

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('destinations', 'trip_likes');

-- Check if we have sample data
SELECT COUNT(*) as destination_count FROM public.destinations;
SELECT COUNT(*) as likes_count FROM public.trip_likes;
