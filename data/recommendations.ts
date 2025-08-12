export type CityMeta = {
  city: string
  country: string
  region: "Europe" | "Asia" | "Americas" | "Africa" | "Oceania"
  subregion: string
  rating: number // 1-5
  expense: "budget" | "mid" | "premium"
  image: string
}

export type ActivityMeta = {
  city: string
  title: string
  type: "sightseeing" | "adventure" | "food" | "culture" | "nature" | "nightlife"
  avg_cost: number
  duration_hours: number
  image: string
  website?: string
}

export const CITIES: CityMeta[] = [
  {
    city: "Paris",
    country: "France",
    region: "Europe",
    subregion: "Western Europe",
    rating: 4.8,
    expense: "premium",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Kyoto",
    country: "Japan",
    region: "Asia",
    subregion: "East Asia",
    rating: 4.9,
    expense: "premium",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d0?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Lisbon",
    country: "Portugal",
    region: "Europe",
    subregion: "Southern Europe",
    rating: 4.6,
    expense: "mid",
    image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Bangkok",
    country: "Thailand",
    region: "Asia",
    subregion: "Southeast Asia",
    rating: 4.5,
    expense: "budget",
    image: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Cusco",
    country: "Peru",
    region: "Americas",
    subregion: "South America",
    rating: 4.7,
    expense: "mid",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Cape Town",
    country: "South Africa",
    region: "Africa",
    subregion: "Southern Africa",
    rating: 4.7,
    expense: "mid",
    image: "https://images.unsplash.com/photo-1524146128014-3e7a9818c014?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    subregion: "Australia",
    rating: 4.6,
    expense: "premium",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad75?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    subregion: "Southern Europe",
    rating: 4.7,
    expense: "mid",
    image: "https://images.unsplash.com/photo-1508057198894-793ba5b0c0f5?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Bali",
    country: "Indonesia",
    region: "Asia",
    subregion: "Southeast Asia",
    rating: 4.8,
    expense: "budget",
    image: "https://images.unsplash.com/photo-1546484959-f9a53db89f6c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "New York",
    country: "USA",
    region: "Americas",
    subregion: "North America",
    rating: 4.7,
    expense: "premium",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80&auto=format&fit=crop",
  },
]

export const ACTIVITIES: ActivityMeta[] = [
  {
    city: "Paris",
    title: "Louvre Museum",
    type: "culture",
    avg_cost: 22,
    duration_hours: 3,
    image: "https://images.unsplash.com/photo-1543340713-8b1f2e6f9f79?w=1200&q=80&auto=format&fit=crop",
    website: "https://www.louvre.fr/en",
  },
  {
    city: "Paris",
    title: "Eiffel Tower Night View",
    type: "sightseeing",
    avg_cost: 28,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Kyoto",
    title: "Fushimi Inari Shrine",
    type: "culture",
    avg_cost: 0,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1560109947-543149eceb11?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Kyoto",
    title: "Gion Food Walk",
    type: "food",
    avg_cost: 45,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Lisbon",
    title: "Tram 28 Ride",
    type: "sightseeing",
    avg_cost: 3,
    duration_hours: 1,
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Bangkok",
    title: "Temple of the Emerald Buddha",
    type: "culture",
    avg_cost: 16,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1513617331935-8be1c5c1a4d8?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Cusco",
    title: "Sacsayhuamán Ruins",
    type: "adventure",
    avg_cost: 40,
    duration_hours: 3,
    image: "https://images.unsplash.com/photo-1531168550546-86f1d5632a6a?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Cape Town",
    title: "Table Mountain Hike",
    type: "nature",
    avg_cost: 0,
    duration_hours: 4,
    image: "https://images.unsplash.com/photo-1544989164-31dc3c645987?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Sydney",
    title: "Harbour Bridge Climb",
    type: "adventure",
    avg_cost: 120,
    duration_hours: 3,
    image: "https://images.unsplash.com/photo-1510749677-747de66b5b95?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Barcelona",
    title: "Sagrada Familia",
    type: "culture",
    avg_cost: 26,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1508057198894-93e75f2a1bf5?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "Bali",
    title: "Ubud Rice Terrace",
    type: "nature",
    avg_cost: 0,
    duration_hours: 2,
    image: "https://images.unsplash.com/photo-1526481280698-8fcc13fd6048?w=1200&q=80&auto=format&fit=crop",
  },
  {
    city: "New York",
    title: "Broadway Show",
    type: "culture",
    avg_cost: 100,
    duration_hours: 3,
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1200&q=80&auto=format&fit=crop",
  },
]
