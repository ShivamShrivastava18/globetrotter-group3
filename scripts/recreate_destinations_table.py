import requests
import csv
import io
import os
from supabase import create_client, Client

def main():
    # Initialize Supabase client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(url, key)
    
    print("Fetching CSV data...")
    # Fetch the CSV data
    csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset-lPNrll30h6qGbEMu2AVFMFowbBBrDh.csv"
    response = requests.get(csv_url)
    response.raise_for_status()
    
    print("Dropping existing destinations table...")
    # Drop the existing destinations table
    try:
        supabase.rpc('exec_sql', {'sql': 'DROP TABLE IF EXISTS destinations CASCADE;'}).execute()
    except Exception as e:
        print(f"Note: {e}")
    
    print("Creating new destinations table...")
    # Create new destinations table without rating column
    create_table_sql = """
    CREATE TABLE destinations (
        id TEXT PRIMARY KEY,
        region TEXT,
        country TEXT,
        name TEXT,
        best_time TEXT,
        price_range TEXT,
        description TEXT,
        highlights TEXT[],
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    try:
        supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
        print("Table created successfully!")
    except Exception as e:
        print(f"Error creating table: {e}")
        return
    
    print("Parsing CSV data...")
    # Parse the CSV data (tab-separated)
    csv_content = response.text
    csv_reader = csv.reader(io.StringIO(csv_content), delimiter='\t')
    
    destinations = []
    for i, row in enumerate(csv_reader):
        if i == 0:  # Skip header
            continue
            
        if len(row) >= 9:
            region, country, dest_id, name, best_time, price_range, description, highlights, image_url = row[:9]
            
            # Convert highlights string to array
            highlights_array = [h.strip() for h in highlights.split(';') if h.strip()]
            
            destination = {
                'id': dest_id,
                'region': region,
                'country': country,
                'name': name,
                'best_time': best_time,
                'price_range': price_range,
                'description': description,
                'highlights': highlights_array,
                'image_url': image_url
            }
            destinations.append(destination)
    
    print(f"Inserting {len(destinations)} destinations...")
    # Insert destinations in batches
    batch_size = 50
    for i in range(0, len(destinations), batch_size):
        batch = destinations[i:i + batch_size]
        try:
            result = supabase.table('destinations').insert(batch).execute()
            print(f"Inserted batch {i//batch_size + 1}/{(len(destinations) + batch_size - 1)//batch_size}")
        except Exception as e:
            print(f"Error inserting batch {i//batch_size + 1}: {e}")
    
    print("Destinations table recreated and populated successfully!")

if __name__ == "__main__":
    main()
