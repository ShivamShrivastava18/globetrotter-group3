import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const geminiApiKey = "AIzaSyA2mr48_Pe1i-tBZPqgwRlWOmU6bXbZODA"

const google = createGoogleGenerativeAI({
  apiKey: geminiApiKey,
})

const model = google("models/gemini-1.5-flash-latest")

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
      return NextResponse.json({ error: "AI features disabled. Add your Gemini API key." }, { status: 500 })
    }

    const systemPrompt = `You are an expert travel planner. Generate a detailed, day-by-day itinerary based on the user's request.

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or markdown formatting.

The JSON structure must be exactly:
{
  "stops": [
    {
      "day": 1,
      "title": "Day 1: Arrival and City Center",
      "activities": [
        {
          "title": "Activity name",
          "start_time": "9:00 AM",
          "description": "Brief description of the activity",
          "estimated_cost": 50
        }
      ]
    }
  ]
}

Rules:
- Each day must have a descriptive title
- Each activity needs title, start_time, description, and estimated_cost (as number)
- Ensure realistic timing and costs
- Include 3-5 activities per day
- Make sure the JSON is valid and complete`

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt,
      maxTokens: 2000,
    })

    // Clean the response to ensure it's valid JSON
    let cleanedText = text.trim()

    // Remove any markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Find the JSON object in the response
    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON found in response")
    }

    cleanedText = cleanedText.substring(jsonStart, jsonEnd)

    // Parse and validate the JSON
    let itinerary
    try {
      itinerary = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.error("Raw response:", text)
      throw new Error("Invalid JSON response from AI")
    }

    // Validate the structure
    if (!itinerary.stops || !Array.isArray(itinerary.stops)) {
      throw new Error("Invalid itinerary structure")
    }

    return NextResponse.json(itinerary)
  } catch (error: any) {
    console.error("Error generating itinerary:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate itinerary",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
