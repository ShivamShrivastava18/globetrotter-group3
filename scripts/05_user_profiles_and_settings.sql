-- User profiles table to store additional user information
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  phone_number text,
  profile_picture_url text,
  bio text,
  date_of_birth date,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User settings table for user preferences
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  dark_mode boolean default false,
  email_notifications boolean default true,
  push_notifications boolean default true,
  privacy_public_profile boolean default false,
  language text default 'en',
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for better performance
create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
create index if not exists user_settings_user_id_idx on public.user_settings(user_id);

-- RLS policies for security
alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;

-- Users can only view and edit their own profiles and settings
create policy "user_profiles_own" on public.user_profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings_own" on public.user_settings
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to create profile and settings on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  insert into public.user_settings (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile and settings for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
