import requests
import csv
import io

# Fetch the CSV data
url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/destination_dataset-zxiIk5wMFAwDsfPFcq2IsNwgwtL1t7.csv"
response = requests.get(url)
csv_content = response.text

# Parse the CSV (it's tab-separated based on the schema)
csv_reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')

# Generate SQL INSERT statements
sql_statements = []
sql_statements.append("-- Clear existing destinations")
sql_statements.append("DELETE FROM destinations;")
sql_statements.append("")
sql_statements.append("-- Insert destination data")

for row in csv_reader:
    # Parse highlights into array format
    highlights_str = row.get('highlights', '')
    highlights_array = [h.strip() for h in highlights_str.split(';') if h.strip()]
    highlights_sql = "ARRAY[" + ", ".join([f"'{h.replace(\"'\", \"''\")}'" for h in highlights_array]) + "]"
    
    # Escape single quotes in text fields
    def escape_sql(text):
        if text is None:
            return 'NULL'
        return f"'{text.replace(\"'\", \"''\")}'"
    
    # Create INSERT statement
    insert_sql = f"""INSERT INTO destinations (
    id, region, country, name, best_time, price_range, 
    description, highlights, image_url, rating, created_at
) VALUES (
    {escape_sql(row.get('id'))},
    {escape_sql(row.get('region'))},
    {escape_sql(row.get('country'))},
    {escape_sql(row.get('name'))},
    {escape_sql(row.get('best_time'))},
    {escape_sql(row.get('price_range'))},
    {escape_sql(row.get('description'))},
    {highlights_sql},
    {escape_sql(row.get('image_url'))},
    4.5,
    NOW()
);"""
    
    sql_statements.append(insert_sql)

# Write to SQL file
with open('scripts/populate_destinations.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated SQL file with {len(sql_statements)-3} destination records")
