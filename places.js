
// Fetch activities from Google Places
const city = "agra";
const API_KEY = "AIzaSyA8wq3R8WASxgUqTvWCh5blEmGzU8njVZ0";

// Async function to fetch activities
async function getActivities(city) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=things+to+do+in+${encodeURIComponent(city)}&key=${API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    console.error("No places found or API call failed:", data);
    return [];
  }

  // Rank by reviews (popularity)
  const ranked = data.results
    .sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0))
    .map(p => ({
      name: p.name,
      rating: p.rating,
      reviews: p.user_ratings_total,
      address: p.formatted_address || p.vicinity,
      location: p.geometry?.location,
    }));

  return ranked;
}

getActivities(city).then(console.log);

