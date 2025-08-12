import requests
import csv
from io import StringIO
import json

# Fetch the CSV data
csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset-lPNrll30h6qGbEMu2AVFMFowbBBrDh.csv"

try:
    response = requests.get(csv_url)
    response.raise_for_status()
    
    # Parse the CSV data
    csv_content = response.text
    csv_reader = csv.DictReader(StringIO(csv_content), delimiter='\t')
    
    destinations = []
    for row in csv_reader:
        # Parse the row data
        region = row.get('region', '').strip()
        country = row.get('country', '').strip()
        dest_id = row.get('id', '').strip()
        name = row.get('name', '').strip()
        best_time = row.get('best_time', '').strip()
        price_range = row.get('price_range', '').strip()
        description = row.get('description', '').strip()
        highlights = row.get('highlights', '').strip()
        image_url = row.get('image_url', '').strip()
        
        # Convert highlights to array format
        highlights_array = [h.strip() for h in highlights.split(';') if h.strip()] if highlights else []
        
        destination = {
            'id': dest_id,
            'name': name,
            'country': country,
            'region': region,
            'description': description,
            'image_url': image_url,
            'price_range': price_range,
            'best_time': best_time,
            'highlights': highlights_array
        }
        
        destinations.append(destination)
    
    print(f"Successfully parsed {len(destinations)} destinations from CSV")
    
    # Generate TypeScript code for hardcoded destinations
    ts_code = "const hardcodedDestinations: Destination[] = [\n"
    
    for dest in destinations:
        # Escape quotes and backslashes properly
        name_escaped = dest['name'].replace('\\', '\\\\').replace('"', '\\"')
        country_escaped = dest['country'].replace('\\', '\\\\').replace('"', '\\"')
        description_escaped = dest['description'].replace('\\', '\\\\').replace('"', '\\"')
        
        ts_code += "  {\n"
        ts_code += f'    id: "{dest["id"]}",\n'
        ts_code += f'    name: "{name_escaped}",\n'
        ts_code += f'    country: "{country_escaped}",\n'
        ts_code += f'    region: "{dest["region"]}",\n'
        ts_code += f'    description: "{description_escaped}",\n'
        ts_code += f'    image_url: "{dest["image_url"]}",\n'
        ts_code += f'    price_range: "{dest["price_range"]}",\n'
        ts_code += f'    best_time: "{dest["best_time"]}",\n'
        ts_code += f'    highlights: {json.dumps(dest["highlights"])},\n'
        ts_code += "  },\n"
    
    ts_code += "];\n"
    
    # Write to file
    with open('hardcoded_destinations.ts', 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print("Generated hardcoded_destinations.ts file")
    
except Exception as e:
    print(f"Error: {e}")
