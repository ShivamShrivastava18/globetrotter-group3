-- Destinations table for explore page
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  region text not null,
  description text,
  image_url text,
  rating numeric(2,1) default 0,
  price_range text check (price_range in ('budget', 'mid-range', 'luxury')),
  best_time text,
  highlights text[],
  created_at timestamptz default now()
);

-- Trip likes table
create table if not exists public.trip_likes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- Indexes for performance
create index if not exists destinations_region_idx on public.destinations(region);
create index if not exists destinations_price_idx on public.destinations(price_range);
create index if not exists trip_likes_trip_idx on public.trip_likes(trip_id);
create index if not exists trip_likes_user_idx on public.trip_likes(user_id);

-- RLS policies
alter table public.destinations enable row level security;
alter table public.trip_likes enable row level security;

-- Destinations are public for everyone to read
create policy "destinations_public_read" on public.destinations
  for select using (true);

-- Only authenticated users can manage likes
create policy "trip_likes_own" on public.trip_likes
  for all using (auth.uid() = user_id);

-- Insert sample destinations
insert into public.destinations (name, country, region, description, image_url, rating, price_range, best_time, highlights) values
('Tokyo', 'Japan', 'Asia', 'Experience the perfect blend of traditional culture and cutting-edge technology in Japan''s vibrant capital.', '/tokyo-modern-neon.png', 4.9, 'luxury', 'March - May, September - November', '{"Shibuya Crossing","Mount Fuji","Traditional Temples","Modern Architecture"}'),
('Santorini', 'Greece', 'Europe', 'Stunning sunsets, whitewashed buildings, and crystal-clear waters make this Greek island paradise unforgettable.', '/santorini-sunset-white-buildings.png', 4.8, 'luxury', 'April - October', '{"Oia Sunset","Red Beach","Wine Tasting","Volcanic Views"}'),
('Bali', 'Indonesia', 'Asia', 'Tropical paradise with lush rice terraces, ancient temples, and world-class beaches.', '/bali-rice-terraces-tropical.png', 4.7, 'mid-range', 'April - October', '{"Ubud Rice Terraces","Beach Clubs","Temple Tours","Volcano Hiking"}'),
('Paris', 'France', 'Europe', 'The City of Light offers world-class museums, romantic streets, and exceptional cuisine.', '/paris-eiffel-tower-romantic.png', 4.8, 'luxury', 'April - June, September - October', '{"Eiffel Tower","Louvre Museum","Seine River","Montmartre"}'),
('Machu Picchu', 'Peru', 'South America', 'Ancient Incan citadel perched high in the Andes Mountains, one of the New Seven Wonders of the World.', '/machu-picchu-mountains-ruins.png', 4.9, 'mid-range', 'May - September', '{"Inca Trail","Sacred Valley","Cusco City","Andean Culture"}'),
('Dubai', 'UAE', 'Middle East', 'Ultra-modern city with luxury shopping, innovative architecture, and desert adventures.', '/dubai-skyline-burj-khalifa.png', 4.6, 'luxury', 'November - March', '{"Burj Khalifa","Desert Safari","Gold Souk","Palm Jumeirah"}'),
('Bangkok', 'Thailand', 'Asia', 'Vibrant street life, ornate shrines, and bustling markets in Thailand''s capital city.', '/bustling-tokyo-street.png', 4.5, 'budget', 'November - March', '{"Grand Palace","Floating Markets","Street Food","Temples"}'),
('Barcelona', 'Spain', 'Europe', 'Architectural marvels, Mediterranean beaches, and vibrant nightlife in Catalonia''s capital.', '/european-cityscape.png', 4.7, 'mid-range', 'April - June, September - October', '{"Sagrada Familia","Park Güell","Gothic Quarter","Beaches"}'),
('Cape Town', 'South Africa', 'Africa', 'Stunning landscapes, wine regions, and rich cultural heritage at the tip of Africa.', '/serene-coastal-village.png', 4.6, 'mid-range', 'November - March', '{"Table Mountain","Wine Tours","Penguins","Waterfront"}'),
('Kyoto', 'Japan', 'Asia', 'Ancient temples, traditional gardens, and preserved historic districts in Japan''s former capital.', '/kyoto-street.png', 4.8, 'mid-range', 'March - May, September - November', '{"Bamboo Grove","Golden Pavilion","Geisha District","Temples"}')
on conflict do nothing;
