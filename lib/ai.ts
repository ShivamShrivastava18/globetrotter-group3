import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

// IMPORTANT: As requested, the API key is hardcoded.
// For production, it is strongly recommended to use environment variables.
const geminiApiKey = "AIzaSyA2mr48_Pe1i-tBZPqgwRlWOmU6bXbZODA"

const google = createGoogleGenerativeAI({
  apiKey: geminiApiKey,
})

const model = google("models/gemini-1.5-flash-latest")

export async function serverTripOverview(name: string, description?: string | null) {
  if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
    return "AI overview disabled. Add your Gemini API key to lib/ai.ts."
  }
  try {
    const { text } = await generateText({
      model,
      system:
        "You are a concise, inspiring travel copywriter. Return 1 sentence under 32 words. Avoid emojis and cliches; suggest vibe and pace.",
      prompt: `Trip: ${name}\nDetails: ${description ?? ""}`,
    })
    return text
  } catch (error) {
    console.error("Error generating trip overview:", error)
    return "Could not generate AI overview."
  }
}
