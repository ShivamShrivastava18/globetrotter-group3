import requests
import csv
import io

# Fetch the CSV data
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset-lPNrll30h6qGbEMu2AVFMFowbBBrDh.csv"
response = requests.get(url)
csv_content = response.text

# Parse the tab-separated CSV
csv_reader = csv.reader(io.StringIO(csv_content), delimiter='\t')
rows = list(csv_reader)

print(f"Found {len(rows)} rows in CSV")
print("Sample row:", rows[0] if rows else "No data")

# Generate SQL file
with open('scripts/recreate_destinations.sql', 'w') as f:
    f.write("-- Drop and recreate destinations table\n")
    f.write("DROP TABLE IF EXISTS destinations CASCADE;\n\n")
    
    f.write("""CREATE TABLE destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT,
    best_time TEXT,
    price_range TEXT,
    highlights TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

""")
    
    f.write("-- Insert destination data\n")
    
    for row in rows:
        if len(row) >= 9:  # Ensure we have all columns
            region, country, dest_id, name, best_time, price_range, description, highlights, image_url = row[:9]
            
            # Convert highlights to array format
            highlights_array = highlights.split(';') if highlights else []
            highlights_sql = "ARRAY[" + ",".join([f"'{h.strip().replace(\"'\", \"''\")}'" for h in highlights_array]) + "]"
            
            # Escape single quotes in text fields
            name = name.replace("'", "''")
            country = country.replace("'", "''")
            region = region.replace("'", "''")
            description = description.replace("'", "''")
            best_time = best_time.replace("'", "''")
            price_range = price_range.replace("'", "''")
            
            f.write(f"""INSERT INTO destinations (id, name, country, region, description, best_time, price_range, highlights, image_url)
VALUES ('{dest_id}', '{name}', '{country}', '{region}', '{description}', '{best_time}', '{price_range}', {highlights_sql}, '{image_url}');
""")

print("SQL file generated: scripts/recreate_destinations.sql")
