export type Trip = {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  cover_url: string | null
  is_public: boolean
  created_at: string
}

export type TripStop = {
  id: string
  trip_id: string
  city: string
  country: string | null
  lat: number | null
  lng: number | null
  start_date: string
  end_date: string
  order_index: number
}

export type Activity = {
  id: string
  trip_id: string
  stop_id: string | null
  title: string
  notes: string | null
  start_time: string | null
  end_time: string | null
  estimated_cost: number | null
  lat: number | null
  lng: number | null
  booking_url: string | null
  created_at: string
}
