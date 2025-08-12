-- Quick verification: limited to your logged-in user in the Supabase SQL editor
-- Replace the UUID with your auth UID to test inserts manually if needed.

-- select 'extensions' as section, extname from pg_extension where extname in ('pgcrypto','uuid-ossp');

-- select 'tables' as section, table_name from information_schema.tables where table_schema='public' and table_name in ('trips','trip_stops','activities','hotels');

-- Example insert (uncomment and replace YOUR_USER_ID)
-- insert into public.trips (user_id, name, start_date, end_date)
-- values ('YOUR_USER_ID', 'Test Trip', '2025-10-01', '2025-10-05')
-- returning id;
