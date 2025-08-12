import requests
import json
import csv
from io import StringIO

def fetch_csv_destinations():
    """Fetch destinations from the CSV file and format for hardcoding"""
    
    csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset_highlights_cleaned-3EAdlN6pLYAOAOgIZfxmrmOfZqC8en.csv"
    
    try:
        print("Fetching CSV data...")
        response = requests.get(csv_url)
        response.raise_for_status()
        
        # Parse CSV
        csv_data = StringIO(response.text)
        reader = csv.DictReader(csv_data)
        
        destinations = []
        for row in reader:
            # Clean up highlights - remove brackets and quotes
            highlights_str = row.get('highlights', '[]')
            try:
                # Try to parse as JSON array
                highlights = json.loads(highlights_str.replace("'", '"'))
            except:
                # Fallback: split by comma and clean
                highlights = [h.strip().strip("'\"") for h in highlights_str.strip("[]").split(',')]
            
            destination = {
                'id': int(row['id']),
                'name': row['name'],
                'country': row['country'],
                'region': row['region'],
                'description': row['description'],
                'highlights': highlights,
                'best_time': row['best_time'],
                'price_range': row['price_range'],
                'image_url': row['image_url']
            }
            destinations.append(destination)
        
        print(f"Successfully fetched {len(destinations)} destinations")
        
        # Print first few destinations for verification
        for i, dest in enumerate(destinations[:5]):
            print(f"\n{i+1}. {dest['name']}, {dest['country']}")
            print(f"   Region: {dest['region']}")
            print(f"   Price: {dest['price_range']}")
            print(f"   Image: {dest['image_url']}")
        
        return destinations
        
    except Exception as e:
        print(f"Error fetching CSV data: {e}")
        return []

if __name__ == "__main__":
    destinations = fetch_csv_destinations()
    print(f"\nTotal destinations fetched: {len(destinations)}")
