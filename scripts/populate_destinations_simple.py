import os
from supabase import create_client, Client

# Supabase configuration
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
    exit(1)

supabase: Client = create_client(url, key)

# Sample destinations data
destinations_data = [
    {
        'id': 1,
        'name': 'Tokyo',
        'country': 'Japan',
        'region': 'Asia',
        'description': 'Experience the perfect blend of traditional culture and cutting-edge technology in Japan\'s vibrant capital.',
        'image_url': '/bustling-tokyo-street.png',
        'price_range': 'luxury',
        'best_time': 'March - May, September - November',
        'highlights': ['Shibuya Crossing', 'Mount Fuji', 'Traditional Temples', 'Modern Architecture']
    },
    {
        'id': 2,
        'name': 'Santorini',
        'country': 'Greece',
        'region': 'Europe',
        'description': 'Stunning sunsets, whitewashed buildings, and crystal-clear waters make this Greek island paradise unforgettable.',
        'image_url': '/santorini-greece.png',
        'price_range': 'luxury',
        'best_time': 'April - October',
        'highlights': ['Oia Sunset', 'Red Beach', 'Wine Tasting', 'Volcanic Views']
    },
    {
        'id': 3,
        'name': 'Bali',
        'country': 'Indonesia',
        'region': 'Asia',
        'description': 'Tropical paradise with lush rice terraces, ancient temples, and world-class beaches.',
        'image_url': '/bali-indonesia.png',
        'price_range': 'mid-range',
        'best_time': 'April - October',
        'highlights': ['Ubud Rice Terraces', 'Beach Clubs', 'Temple Tours', 'Volcano Hiking']
    },
    {
        'id': 4,
        'name': 'Paris',
        'country': 'France',
        'region': 'Europe',
        'description': 'The City of Light offers world-class museums, romantic streets, and exceptional cuisine.',
        'image_url': '/paris-summer.png',
        'price_range': 'luxury',
        'best_time': 'April - June, September - October',
        'highlights': ['Eiffel Tower', 'Louvre Museum', 'Seine River', 'Montmartre']
    },
    {
        'id': 5,
        'name': 'Machu Picchu',
        'country': 'Peru',
        'region': 'South America',
        'description': 'Ancient Incan citadel perched high in the Andes Mountains, one of the New Seven Wonders of the World.',
        'image_url': '/diverse-travel-destinations.png',
        'price_range': 'mid-range',
        'best_time': 'May - September',
        'highlights': ['Inca Trail', 'Sacred Valley', 'Cusco City', 'Andean Culture']
    },
    {
        'id': 6,
        'name': 'Dubai',
        'country': 'UAE',
        'region': 'Middle East',
        'description': 'Ultra-modern city with luxury shopping, innovative architecture, and desert adventures.',
        'image_url': '/diverse-travel-destinations.png',
        'price_range': 'luxury',
        'best_time': 'November - March',
        'highlights': ['Burj Khalifa', 'Desert Safari', 'Gold Souk', 'Palm Jumeirah']
    },
    {
        'id': 7,
        'name': 'Bangkok',
        'country': 'Thailand',
        'region': 'Asia',
        'description': 'Vibrant street life, ornate shrines, and bustling markets in Thailand\'s capital city.',
        'image_url': '/bustling-tokyo-street.png',
        'price_range': 'budget',
        'best_time': 'November - March',
        'highlights': ['Grand Palace', 'Floating Markets', 'Street Food', 'Temples']
    },
    {
        'id': 8,
        'name': 'Barcelona',
        'country': 'Spain',
        'region': 'Europe',
        'description': 'Architectural marvels, Mediterranean beaches, and vibrant nightlife in Catalonia\'s capital.',
        'image_url': '/diverse-travel-destinations.png',
        'price_range': 'mid-range',
        'best_time': 'April - June, September - October',
        'highlights': ['Sagrada Familia', 'Park Güell', 'Gothic Quarter', 'Beaches']
    },
    {
        'id': 9,
        'name': 'Cape Town',
        'country': 'South Africa',
        'region': 'Africa',
        'description': 'Stunning landscapes, wine regions, and rich cultural heritage at the tip of Africa.',
        'image_url': '/diverse-travel-destinations.png',
        'price_range': 'mid-range',
        'best_time': 'November - March',
        'highlights': ['Table Mountain', 'Wine Tours', 'Penguins', 'Waterfront']
    },
    {
        'id': 10,
        'name': 'Kyoto',
        'country': 'Japan',
        'region': 'Asia',
        'description': 'Ancient temples, traditional gardens, and preserved historic districts in Japan\'s former capital.',
        'image_url': '/kyoto-street.png',
        'price_range': 'mid-range',
        'best_time': 'March - May, September - November',
        'highlights': ['Bamboo Grove', 'Golden Pavilion', 'Geisha District', 'Temples']
    }
]

try:
    # Clear existing destinations first
    print("Clearing existing destinations...")
    supabase.table('destinations').delete().neq('id', 0).execute()
    
    # Insert new destinations
    print(f"Inserting {len(destinations_data)} destinations...")
    result = supabase.table('destinations').insert(destinations_data).execute()
    
    print("Successfully populated destinations!")
    
    # Verify the data
    count_result = supabase.table('destinations').select('id', count='exact').execute()
    print(f"Total destinations in database: {count_result.count}")
    
except Exception as e:
    print(f"Error: {str(e)}")
