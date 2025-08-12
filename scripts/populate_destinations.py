import csv
import requests
from io import StringIO
import os
from supabase import create_client, Client

# Supabase configuration
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
    exit(1)

supabase: Client = create_client(url, key)

# Fetch the CSV data
csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset-zxiIk5wMFAwDsfPFcq2IsNwgwtL1t7.csv"

try:
    response = requests.get(csv_url)
    response.raise_for_status()
    
    # Parse CSV data
    csv_data = StringIO(response.text)
    reader = csv.DictReader(csv_data, delimiter='\t')
    
    destinations_to_insert = []
    
    for row in reader:
        # Parse highlights from string to array
        highlights_str = row.get('highlights', '')
        highlights_array = [h.strip() for h in highlights_str.split(';') if h.strip()] if highlights_str else []
        
        # Prepare destination data matching the database schema
        destination = {
            'id': row.get('id'),
            'name': row.get('name'),
            'country': row.get('country'),
            'region': row.get('region'),
            'description': row.get('description'),
            'best_time': row.get('best_time'),
            'price_range': row.get('price_range'),
            'highlights': highlights_array,
            'image_url': row.get('image_url'),
            'rating': None  # Not provided in CSV, will be null
        }
        
        destinations_to_insert.append(destination)
    
    print(f"Parsed {len(destinations_to_insert)} destinations from CSV")
    
    # Clear existing destinations first
    print("Clearing existing destinations...")
    supabase.table('destinations').delete().neq('id', '').execute()
    
    # Insert destinations in batches to avoid API limits
    batch_size = 100
    total_inserted = 0
    
    for i in range(0, len(destinations_to_insert), batch_size):
        batch = destinations_to_insert[i:i + batch_size]
        
        try:
            result = supabase.table('destinations').insert(batch).execute()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}: {len(batch)} destinations")
        except Exception as e:
            print(f"Error inserting batch {i//batch_size + 1}: {str(e)}")
            # Continue with next batch
            continue
    
    print(f"Successfully populated {total_inserted} destinations in the database!")
    
    # Verify the data
    count_result = supabase.table('destinations').select('id', count='exact').execute()
    print(f"Total destinations in database: {count_result.count}")
    
except requests.RequestException as e:
    print(f"Error fetching CSV data: {str(e)}")
except Exception as e:
    print(f"Error processing data: {str(e)}")
