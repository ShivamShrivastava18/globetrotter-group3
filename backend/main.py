#!/usr/bin/env python3
"""
FastAPI Backend for AI-Powered Travel Itinerary Generator
Wraps the existing Python script with REST API endpoints
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the existing travel generator
from travel_generator import AITravelItineraryGenerator

app = FastAPI(title="AI Travel Itinerary API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class TripRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: str  # 'low', 'medium', 'high'

class HotelSearchRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: str

class ActivitySearchRequest(BaseModel):
    destination: str
    budget: str
    duration: int
    selected_hotel: Optional[Dict] = None

class ItineraryRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: str
    duration: int
    selected_hotel: Dict
    activities: List[Dict]

class Hotel(BaseModel):
    id: str
    name: str
    description: str
    price: str
    rating: str
    location: str
    amenities: List[str]

class Activity(BaseModel):
    name: str
    description: str
    price: str
    hours: str
    distance: str
    transport: str

class DayPlan(BaseModel):
    day: int
    date: str
    activities: List[Activity]
    ai_suggestions: str

class ItineraryResponse(BaseModel):
    destination: str
    dates: str
    duration: str
    budget: str
    selected_hotel: Dict
    daily_schedule: List[DayPlan]
    generated_by: str

# Initialize the AI generator
generator = None

@app.on_event("startup")
async def startup_event():
    """Initialize the AI generator on startup"""
    global generator
    try:
        # Set environment variables
        os.environ['GEMINI_API_KEY'] = ''
        os.environ['TAVILY_API_KEY'] = ''
        
        generator = AITravelItineraryGenerator()
        print("✅ AI Travel Generator initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing AI generator: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Travel Itinerary API is running", "status": "healthy"}

@app.post("/api/search-hotels")
async def search_hotels(request: HotelSearchRequest):
    """Search for hotels using AI agent"""
    try:
        if not generator:
            raise HTTPException(status_code=500, detail="AI generator not initialized")
        
        print(f"🔍 Searching hotels in {request.destination} for {request.budget} budget...")
        
        # Calculate duration
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        duration = (end_date - start_date).days
        
        # Use the existing search_hotels method
        hotels_data = generator.search_hotels(
            request.destination,
            request.start_date,
            request.end_date,
            request.budget
        )
        
        # Convert to frontend format with IDs and amenities
        hotels = []
        for i, hotel in enumerate(hotels_data):
            # Generate amenities based on hotel description and price
            amenities = generate_amenities(hotel, request.budget)
            
            hotels.append({
                "id": str(i + 1),
                "name": hotel.get('name', f'Hotel {i+1}'),
                "description": hotel.get('description', 'No description available'),
                "price": hotel.get('price', 'Price varies'),
                "rating": hotel.get('rating', 'Rating not available'),
                "location": hotel.get('location', request.destination),
                "amenities": amenities
            })
        
        return {"hotels": hotels}
        
    except Exception as e:
        print(f"❌ Error searching hotels: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching hotels: {str(e)}")

@app.post("/api/search-activities")
async def search_activities(request: ActivitySearchRequest):
    """Search for activities using AI agent"""
    try:
        if not generator:
            raise HTTPException(status_code=500, detail="AI generator not initialized")
        
        print(f"🔍 Searching activities in {request.destination}...")
        
        # Use the existing search_activities method
        activities_data = generator.search_activities(
            request.destination,
            request.budget,
            request.duration,
            request.selected_hotel
        )
        
        # Convert to frontend format
        activities = []
        for activity in activities_data:
            activities.append({
                "name": activity.get('name', 'Unknown Activity'),
                "description": activity.get('description', 'No description available'),
                "price": activity.get('price', 'Price varies'),
                "hours": activity.get('hours', 'Check local timings'),
                "distance": activity.get('distance', 'Distance varies'),
                "transport": activity.get('transport', 'Multiple options available')
            })
        
        return {"activities": activities}
        
    except Exception as e:
        print(f"❌ Error searching activities: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching activities: {str(e)}")

@app.post("/api/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    """Generate complete itinerary using AI agent"""
    try:
        if not generator:
            raise HTTPException(status_code=500, detail="AI generator not initialized")
        
        print(f"🤖 Generating itinerary for {request.destination}...")
        
        # Prepare trip data in the format expected by the generator
        trip_data = {
            'location': request.destination,
            'start_date': request.start_date,
            'end_date': request.end_date,
            'duration': request.duration,
            'budget': request.budget
        }
        
        # Use the existing generate_itinerary method
        itinerary = generator.generate_itinerary(
            trip_data,
            request.selected_hotel,
            request.activities
        )
        
        # Convert daily schedule to frontend format
        daily_schedule = []
        for day_plan in itinerary.get('daily_schedule', []):
            activities = []
            for activity in day_plan.get('activities', []):
                activities.append({
                    "name": activity.get('name', 'Unknown Activity'),
                    "description": activity.get('description', 'No description available'),
                    "price": activity.get('price', 'Price varies'),
                    "hours": activity.get('hours', 'Check local timings'),
                    "distance": activity.get('distance', 'Distance varies'),
                    "transport": activity.get('transport', 'Multiple options available')
                })
            
            daily_schedule.append({
                "day": day_plan.get('day', 1),
                "date": day_plan.get('date', ''),
                "activities": activities,
                "ai_suggestions": day_plan.get('ai_suggestions', '')
            })
        
        response = {
            "destination": itinerary.get('destination', request.destination),
            "dates": itinerary.get('dates', f"{request.start_date} to {request.end_date}"),
            "duration": itinerary.get('duration', f"{request.duration} days"),
            "budget": itinerary.get('budget', request.budget),
            "selected_hotel": itinerary.get('selected_hotel', request.selected_hotel),
            "daily_schedule": daily_schedule,
            "generated_by": itinerary.get('generated_by', 'AI Agent with real-time web data')
        }
        
        return response
        
    except Exception as e:
        print(f"❌ Error generating itinerary: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating itinerary: {str(e)}")

def generate_amenities(hotel: Dict, budget: str) -> List[str]:
    """Generate realistic amenities based on hotel info and budget"""
    base_amenities = ["Wifi"]
    
    # Budget-based amenities
    if budget == "low":
        amenities = base_amenities + ["Shared Bathroom", "Common Area"]
    elif budget == "medium":
        amenities = base_amenities + ["Private Bathroom", "Restaurant", "Room Service"]
    else:  # high budget
        amenities = base_amenities + ["Spa", "Pool", "Gym", "Concierge", "Restaurant", "Room Service"]
    
    # Add amenities based on hotel description
    description = hotel.get('description', '').lower()
    if 'parking' in description:
        amenities.append("Parking")
    if 'pool' in description:
        amenities.append("Pool")
    if 'spa' in description:
        amenities.append("Spa")
    if 'gym' in description or 'fitness' in description:
        amenities.append("Gym")
    if 'restaurant' in description or 'dining' in description:
        amenities.append("Restaurant")
    if 'business' in description:
        amenities.append("Business Center")
    
    # Remove duplicates and return
    return list(set(amenities))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
