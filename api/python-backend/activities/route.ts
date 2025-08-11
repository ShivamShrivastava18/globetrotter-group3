import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { destination, budget, selectedHotel } = await req.json()

    // This would connect to your Python backend
    // Mock activities based on the selected hotel and destination

    const mockActivities = [
      {
        name: `${destination} City Walking Tour`,
        description: `Explore the historic center of ${destination} with a knowledgeable local guide`,
        price: budget === "low" ? "$15" : budget === "medium" ? "$25" : "$45",
        hours: "9:00 AM - 12:00 PM",
        distance: "0.5 km from hotel",
        transport: "5-minute walk from your hotel",
      },
      {
        name: `${destination} Museum of Art`,
        description: `World-class art collection featuring local and international artists`,
        price: budget === "low" ? "$8" : budget === "medium" ? "$15" : "$25",
        hours: "10:00 AM - 6:00 PM",
        distance: "1.2 km from hotel",
        transport: "15-minute walk or short taxi ride",
      },
      {
        name: `Local Food Market Tour`,
        description: `Taste authentic local cuisine and learn about culinary traditions`,
        price: budget === "low" ? "$20" : budget === "medium" ? "$35" : "$60",
        hours: "11:00 AM - 2:00 PM",
        distance: "0.8 km from hotel",
        transport: "10-minute walk from your hotel",
      },
      {
        name: `${destination} Cathedral`,
        description: `Historic cathedral with stunning architecture and city views`,
        price: "Free",
        hours: "8:00 AM - 7:00 PM",
        distance: "0.3 km from hotel",
        transport: "3-minute walk from your hotel",
      },
    ]

    return NextResponse.json({ activities: mockActivities })
  } catch (error: any) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch activities" }, { status: 500 })
  }
}
