-- This script verifies that all migrations have been applied successfully.

-- Verify core tables exist
SELECT 'trips' as table_name, COUNT(*) > 0 as exists FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trips'
UNION ALL
SELECT 'trip_stops', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_stops'
UNION ALL
SELECT 'activities', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities';

-- Verify community feature tables exist
SELECT 'destinations', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'destinations'
UNION ALL
SELECT 'trip_likes', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_likes';

-- Verify user profile and settings tables exist
SELECT 'user_profiles', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles'
UNION ALL
SELECT 'user_settings', COUNT(*) > 0 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings';

-- Check if the new user trigger function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user' AND specific_schema = 'public';
