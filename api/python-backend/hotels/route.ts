import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, budget } = await req.json()

    // This would connect to your Python backend
    // For now, we'll return mock data that matches the Python structure

    const mockHotels = [
      {
        name: `Grand ${destination} Hotel`,
        description: `Luxurious accommodation in the heart of ${destination} with stunning city views and world-class amenities.`,
        price: budget === "low" ? "$80/night" : budget === "medium" ? "$180/night" : "$350/night",
        rating: "4.8/5 stars",
        location: `Central ${destination}`,
        amenities: ["Free WiFi", "Parking", "Restaurant", "Gym", "Spa"],
      },
      {
        name: `${destination} Plaza Suites`,
        description: `Modern suites with kitchenette facilities and panoramic views.`,
        price: budget === "low" ? "$70/night" : budget === "medium" ? "$160/night" : "$320/night",
        rating: "4.6/5 stars",
        location: `Downtown ${destination}`,
        amenities: ["Free WiFi", "Kitchen", "Gym", "Pool"],
      },
      {
        name: `Boutique ${destination} Inn`,
        description: `Charming boutique hotel with personalized service and unique local character.`,
        price: budget === "low" ? "$90/night" : budget === "medium" ? "$200/night" : "$380/night",
        rating: "4.7/5 stars",
        location: `Historic District, ${destination}`,
        amenities: ["Free WiFi", "Restaurant", "Concierge"],
      },
    ]

    return NextResponse.json({ hotels: mockHotels })
  } catch (error: any) {
    console.error("Error fetching hotels:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch hotels" }, { status: 500 })
  }
}
