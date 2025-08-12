-- Core schema with public sharing and indices; compatible policies

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  cover_url text,
  is_public boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_public_idx on public.trips(is_public);

create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  city text not null,
  country text,
  lat double precision,
  lng double precision,
  start_date date not null,
  end_date date not null,
  order_index int not null default 0
);
create index if not exists stops_trip_idx on public.trip_stops(trip_id, order_index);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  stop_id uuid references public.trip_stops(id) on delete set null,
  title text not null,
  notes text,
  start_time text,
  end_time text,
  estimated_cost numeric,
  lat double precision,
  lng double precision,
  booking_url text,
  created_at timestamptz default now()
);
create index if not exists activities_trip_idx on public.activities(trip_id);
create index if not exists activities_stop_idx on public.activities(stop_id);

alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.activities enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='trips_select_own') then
    execute 'drop policy "trips_select_own" on public.trips';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='trips_insert_own') then
    execute 'drop policy "trips_insert_own" on public.trips';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trips' and policyname='trips_update_own') then
    execute 'drop policy "trips_update_own" on public.trips';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trip_stops' and policyname='stops_own') then
    execute 'drop policy "stops_own" on public.trip_stops';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='activities' and policyname='activities_own') then
    execute 'drop policy "activities_own" on public.activities';
  end if;
end$$;

create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id or is_public = true);

create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);

create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id);

create policy "stops_own" on public.trip_stops
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and (t.user_id = auth.uid() or t.is_public = true))
  )
  with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

create policy "activities_own" on public.activities
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and (t.user_id = auth.uid() or t.is_public = true))
  )
  with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );
