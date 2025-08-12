#!/usr/bin/env python3
"""
AI-Powered Travel Itinerary Generator
Uses LangChain agents with Groq LLM and Tavily web search to generate
comprehensive travel itineraries based on real-time web data.
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import create_react_agent, AgentExecutor
from langchain.prompts import PromptTemplate
from langchain.schema import AgentAction, AgentFinish
import warnings
warnings.filterwarnings("ignore")

# Load environment variables from .env file
load_dotenv()

class AITravelItineraryGenerator:
    def __init__(self):
        """Initialize the AI-powered travel itinerary generator"""
        self.setup_environment()
        self.setup_llm_and_tools()
        self.setup_agent()
    
    def setup_environment(self):
        """Setup API keys from .env file"""
        # Load API keys from .env file
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.tavily_api_key = os.getenv('TAVILY_API_KEY')
        
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file. Please add your Gemini API key to the .env file.")
            
        if not self.tavily_api_key:
            raise ValueError("TAVILY_API_KEY not found in .env file. Please add your Tavily API key to the .env file.")
        
        print("✅ API keys loaded successfully from .env file")
    
    def setup_llm_and_tools(self):
        """Initialize LLM and tools"""
        # Initialize Google Gemini LLM with Gemini 2.0 Flash model
        self.llm = ChatGoogleGenerativeAI(
            google_api_key=self.gemini_api_key,
            model="gemini-2.0-flash-exp",
            temperature=0.1,
            max_tokens=4000
        )
        
        # Initialize Tavily search tool with minimal data extraction
        self.search_tool = TavilySearchResults(
            api_key=self.tavily_api_key,
            max_results=3,  # Reduced from 10 to 3 for minimal data extraction
            search_depth="basic"  # Changed from "advanced" to "basic" for faster response
        )
        
        self.tools = [self.search_tool]
    
    def setup_agent(self):
        """Setup the LangChain agent"""
        # Create agent prompt template
        agent_prompt = PromptTemplate.from_template("""
You are a professional travel planning agent. Your job is to search the web for ESSENTIAL information only about hotels and activities for travel planning.

IMPORTANT RULES:
1. ONLY use information from web searches - do not hallucinate or make up data
2. Extract ONLY essential information: name, price range, basic description
3. Filter recommendations based on the specified budget range
4. Keep responses concise and focused - avoid lengthy descriptions
5. Limit to 3-4 options maximum per search to reduce data processing

Available tools: {tools}
Tool names: {tool_names}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Question: {input}
{agent_scratchpad}
""")
        
        # Create ReAct agent
        self.agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=agent_prompt
        )
        
        # Create agent executor
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True
        )
    
    def search_hotels(self, location: str, checkin: str, checkout: str, budget: str) -> List[Dict]:
        """Search for hotels using AI agent with web search"""
        print(f"🤖 AI Agent searching for {budget} budget hotels in {location}...")
        
        query = f"""
        Find 3 hotels in {location} for {budget} budget. Return ONLY:
        
        HOTEL NAME: [Name]
        PRICE: [Price per night]
        RATING: [Star rating]
        
        Budget filters:
        * Low: under $100/night
        * Medium: $100-300/night  
        * High: $300+/night
        
        Keep responses minimal and focused.
        """
        
        try:
            result = self.agent_executor.invoke({"input": query})
            return self._parse_hotel_results(result['output'], location)
        except Exception as e:
            print(f"Error in AI hotel search: {e}")
            return self._get_fallback_hotels(location, budget)
    
    def search_activities(self, location: str, budget: str, duration: int, selected_hotel: Dict = None) -> List[Dict]:
        """Search for exactly 2*duration activities using AI agent with web search"""
        activities_needed = duration * 2  # Exactly 2 activities per day
        
        hotel_info = ""
        if selected_hotel:
            hotel_name = selected_hotel.get('name', '')
            hotel_location = selected_hotel.get('location', '')
            hotel_info = f"near {hotel_name} at {hotel_location}" if hotel_location else f"near {hotel_name}"
        
        print(f"🤖 AI Agent searching for {activities_needed} unique activities in {location} {hotel_info}...")
        
        query = f"""
        Find exactly {activities_needed} unique activities in {location} for {budget} budget. Return ONLY:
        
        ACTIVITY NAME: [Name]
        PRICE: [Cost or "Free"]
        
        Budget filters:
        * Low: free or under $20
        * Medium: $20-100
        * High: $100+
        
        Include mix of: attractions, museums, parks, cultural sites.
        Keep responses minimal and ensure all {activities_needed} activities are different.
        """
        
        try:
            result = self.agent_executor.invoke({"input": query})
            activities = self._parse_activity_results(result['output'], location)
            
            # Ensure we have exactly the right number of activities
            if len(activities) < activities_needed:
                # Add fallback activities to reach the target
                fallback_activities = self._get_fallback_activities(location, budget, activities_needed - len(activities))
                activities.extend(fallback_activities)
            
            return activities[:activities_needed]  # Return exactly what we need
            
        except Exception as e:
            print(f"Error in AI activity search: {e}")
            return self._get_fallback_activities(location, budget, activities_needed)
    
    def generate_itinerary(self, trip_data: Dict, selected_hotel: Dict, activities: List[Dict]) -> Dict:
        """Generate a comprehensive day-by-day itinerary using AI"""
        print("\n🤖 AI Agent generating your personalized itinerary...")
        
        hotel_name = selected_hotel.get('name', 'Selected Hotel')
        hotel_location = selected_hotel.get('location', '')
        
        # Use AI to create optimized daily schedule
        itinerary_query = f"""
        Create an optimized {trip_data['duration']}-day itinerary for {trip_data['location']} 
        from {trip_data['start_date']} to {trip_data['end_date']} with {trip_data['budget']} budget.
        
        Selected hotel: {hotel_name} {f"at {hotel_location}" if hotel_location else ""}
        Available activities: {[a.get('name', 'Unknown') for a in activities]}
        
        Create a logical daily schedule with 2 activities per day considering:
        - Starting point is the selected hotel: {hotel_name}
        - Travel time and distance from hotel to activities
        - Opening hours and availability of attractions
        - Budget constraints for {trip_data['budget']} budget travelers
        - Mix of indoor/outdoor activities
        - Rest periods between activities
        - Local transportation options
        - Efficient routing to minimize travel time
        
        Format as a day-by-day breakdown with morning and afternoon/evening activities.
        Include transportation suggestions from the hotel to each activity.
        """
        
        try:
            ai_schedule = self.agent_executor.invoke({"input": itinerary_query})
            optimized_schedule = self._parse_itinerary_schedule(ai_schedule['output'], trip_data, activities)
        except Exception as e:
            print(f"Error generating AI itinerary: {e}")
            optimized_schedule = self._create_basic_schedule(trip_data, activities)
        
        itinerary = {
            'destination': trip_data['location'],
            'dates': f"{trip_data['start_date']} to {trip_data['end_date']}",
            'duration': f"{trip_data['duration']} days",
            'budget': trip_data['budget'],
            'selected_hotel': selected_hotel,
            'daily_schedule': optimized_schedule,
            'generated_by': 'AI Agent with real-time web data'
        }
        
        return itinerary
    
    def _parse_hotel_results(self, ai_output: str, location: str) -> List[Dict]:
        """Parse AI agent output for hotel information using improved extraction"""
        hotels = []
        try:
            # First try structured parsing with the formatted response
            hotels = self._parse_structured_hotels(ai_output)
            
            # If structured parsing didn't work, try section-based parsing
            if not hotels:
                hotels = self._parse_section_based_hotels(ai_output, location)
            
            # If still no hotels, use fallback extraction
            if not hotels:
                hotels = self._fallback_hotel_extraction(ai_output, location)
                
        except Exception as e:
            print(f"Error parsing hotel results: {e}")
        
        return hotels[:3] if hotels else self._get_fallback_hotels(location, 'medium')
    
    def _parse_structured_hotels(self, ai_output: str) -> List[Dict]:
        """Parse structured hotel format with clear labels"""
        hotels = []
        
        # Look for structured format with labels
        sections = ai_output.split('HOTEL NAME:')
        
        for section in sections[1:]:  # Skip first empty section
            hotel = {
                'name': '',
                'description': '',
                'price': '',
                'rating': '',
                'location': ''
            }
            
            lines = section.split('\n')
            current_field = 'name'
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if line.startswith('DESCRIPTION:'):
                    current_field = 'description'
                    hotel['description'] = line.replace('DESCRIPTION:', '').strip()
                elif line.startswith('PRICE:'):
                    current_field = 'price'
                    hotel['price'] = line.replace('PRICE:', '').strip()
                elif line.startswith('RATING:'):
                    current_field = 'rating'
                    hotel['rating'] = line.replace('RATING:', '').strip()
                elif line.startswith('LOCATION:'):
                    current_field = 'location'
                    hotel['location'] = line.replace('LOCATION:', '').strip()
                elif current_field == 'name' and not hotel['name']:
                    hotel['name'] = line
                elif current_field == 'description' and not line.startswith(('PRICE:', 'RATING:', 'LOCATION:')):
                    hotel['description'] += ' ' + line
            
            # Clean up and add if valid
            if hotel['name']:
                hotel['description'] = hotel['description'][:300] + "..." if len(hotel['description']) > 300 else hotel['description']
                hotels.append(hotel)
        
        return hotels
    
    def _parse_section_based_hotels(self, ai_output: str, location: str) -> List[Dict]:
        """Parse hotels using section-based approach"""
        hotels = []
        sections = ai_output.replace('**', '').replace('*', '').split('\n\n')
        
        for section in sections:
            lines = [line.strip() for line in section.split('\n') if line.strip()]
            if not lines:
                continue
            
            # Look for hotel indicators in the section
            hotel_indicators = ['hotel', 'resort', 'inn', 'lodge', 'suites', 'accommodation']
            has_hotel_keyword = any(indicator in section.lower() for indicator in hotel_indicators)
            
            if has_hotel_keyword and len(lines) >= 2:
                hotel = {
                    'name': '',
                    'description': '',
                    'price': '',
                    'rating': '',
                    'location': ''
                }
                
                # Extract hotel name (usually first line with hotel keyword)
                for line in lines:
                    if any(indicator in line.lower() for indicator in hotel_indicators):
                        hotel['name'] = line.replace(':', '').replace('-', '').strip()
                        break
                
                # Extract other information
                description_parts = []
                for line in lines:
                    line_lower = line.lower()
                    
                    if '$' in line or 'price' in line_lower or '/night' in line_lower or 'cost' in line_lower:
                        hotel['price'] = line
                    elif 'star' in line_lower or 'rating' in line_lower or '/5' in line or 'rated' in line_lower:
                        hotel['rating'] = line
                    elif any(loc_word in line_lower for loc_word in ['address', 'located', 'street', 'avenue', 'area', 'district']):
                        hotel['location'] = line
                    elif line != hotel['name'] and not any(skip in line_lower for skip in ['search', 'result', 'website', 'booking']):
                        description_parts.append(line)
                
                # Combine description parts
                hotel['description'] = ' '.join(description_parts)[:300]
                
                # Only add if we have a name
                if hotel['name']:
                    hotels.append(hotel)
        
        return hotels
    
    def _fallback_hotel_extraction(self, ai_output: str, location: str) -> List[Dict]:
        """Fallback method to extract hotel information"""
        hotels = []
        lines = ai_output.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip().replace('**', '').replace('*', '')
            if any(keyword in line.lower() for keyword in ['hotel', 'resort', 'inn', 'lodge']):
                hotel = {
                    'name': line,
                    'description': '',
                    'price': 'Price varies',
                    'rating': 'Rating not available',
                    'location': location
                }
                
                # Look for additional info in next few lines
                for j in range(i+1, min(i+4, len(lines))):
                    next_line = lines[j].strip()
                    if next_line and len(next_line) > 10:
                        hotel['description'] += next_line + ' '
                
                hotel['description'] = hotel['description'][:200] + "..." if len(hotel['description']) > 200 else hotel['description']
                hotels.append(hotel)
                
                if len(hotels) >= 5:
                    break
        
        return hotels
    
    def _parse_activity_results(self, ai_output: str, location: str) -> List[Dict]:
        """Parse AI agent output for activity information using improved extraction"""
        activities = []
        try:
            # First try structured parsing with the formatted response
            activities = self._parse_structured_activities(ai_output)
            
            # If structured parsing didn't work, try section-based parsing
            if not activities:
                activities = self._parse_section_based_activities(ai_output, location)
            
            # If still no activities, use fallback extraction
            if not activities:
                activities = self._fallback_activity_extraction(ai_output, location)
                
        except Exception as e:
            print(f"Error parsing activity results: {e}")
        
        return activities[:6] if activities else self._get_fallback_activities(location, 'medium')
    
    def _parse_structured_activities(self, ai_output: str) -> List[Dict]:
        """Parse structured activity format with clear labels"""
        activities = []
        
        # Look for structured format with labels
        sections = ai_output.split('ACTIVITY NAME:')
        
        for section in sections[1:]:  # Skip first empty section
            activity = {
                'name': '',
                'description': '',
                'price': '',
                'hours': '',
                'distance': '',
                'transport': ''
            }
            
            lines = section.split('\n')
            current_field = 'name'
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if line.startswith('DESCRIPTION:'):
                    current_field = 'description'
                    activity['description'] = line.replace('DESCRIPTION:', '').strip()
                elif line.startswith('PRICE:'):
                    current_field = 'price'
                    activity['price'] = line.replace('PRICE:', '').strip()
                elif line.startswith('HOURS:'):
                    current_field = 'hours'
                    activity['hours'] = line.replace('HOURS:', '').strip()
                elif line.startswith('DISTANCE:'):
                    current_field = 'distance'
                    activity['distance'] = line.replace('DISTANCE:', '').strip()
                elif line.startswith('TRANSPORT:'):
                    current_field = 'transport'
                    activity['transport'] = line.replace('TRANSPORT:', '').strip()
                elif current_field == 'name' and not activity['name']:
                    activity['name'] = line
                elif current_field == 'description' and not line.startswith(('PRICE:', 'HOURS:', 'DISTANCE:', 'TRANSPORT:')):
                    activity['description'] += ' ' + line
            
            # Clean up and add if valid
            if activity['name']:
                activity['description'] = activity['description'][:200] + "..." if len(activity['description']) > 200 else activity['description']
                activities.append(activity)
        
        return activities
    
    def _parse_section_based_activities(self, ai_output: str, location: str) -> List[Dict]:
        """Parse activities using section-based approach"""
        activities = []
        cleaned_output = ai_output.replace('**', '').replace('*', '')
        sections = cleaned_output.split('\n\n')
        
        activity_keywords = ['museum', 'park', 'tour', 'attraction', 'visit', 'experience', 
                           'temple', 'market', 'restaurant', 'shopping', 'gallery', 'center',
                           'palace', 'fort', 'garden', 'beach', 'monument', 'church', 'mosque']
        
        for section in sections:
            lines = [line.strip() for line in section.split('\n') if line.strip()]
            if not lines:
                continue
            
            # Check if this section contains activity information
            has_activity_keyword = any(keyword in section.lower() for keyword in activity_keywords)
            
            if has_activity_keyword and len(lines) >= 1:
                activity = {
                    'name': '',
                    'description': '',
                    'price': '',
                    'hours': '',
                    'distance': '',
                    'transport': ''
                }
                
                # Extract activity name (first line with activity keyword)
                for line in lines:
                    if any(keyword in line.lower() for keyword in activity_keywords):
                        # Clean up the name
                        activity['name'] = line.replace(':', '').replace('-', '').strip()
                        # Remove numbering if present
                        if activity['name'] and activity['name'][0].isdigit():
                            activity['name'] = '. '.join(activity['name'].split('. ')[1:])
                        break
                
                # Extract other information
                description_parts = []
                for line in lines:
                    line_lower = line.lower()
                    
                    if '$' in line or 'price' in line_lower or 'cost' in line_lower or 'free' in line_lower or 'admission' in line_lower:
                        activity['price'] = line
                    elif any(time_word in line_lower for time_word in ['hour', 'open', 'close', 'am', 'pm', 'timing']):
                        activity['hours'] = line
                    elif any(dist_word in line_lower for dist_word in ['minutes', 'km', 'miles', 'walk', 'distance', 'away']):
                        activity['distance'] = line
                    elif any(transport_word in line_lower for transport_word in ['train', 'bus', 'taxi', 'subway', 'metro', 'transport']):
                        activity['transport'] = line
                    elif line != activity['name'] and not any(skip in line_lower for skip in ['search', 'result', 'website', 'booking']):
                        description_parts.append(line)
                
                # Combine description parts
                activity['description'] = ' '.join(description_parts)[:200]
                
                # Only add if we have a name
                if activity['name']:
                    activities.append(activity)
        
        return activities
    
    def _fallback_activity_extraction(self, ai_output: str, location: str) -> List[Dict]:
        """Fallback method to extract activity information"""
        activities = []
        lines = ai_output.split('\n')
        
        activity_keywords = ['museum', 'park', 'tour', 'attraction', 'visit', 'experience', 
                           'temple', 'market', 'restaurant', 'shopping', 'gallery', 'center']
        
        for i, line in enumerate(lines):
            line = line.strip().replace('**', '').replace('*', '')
            if any(keyword in line.lower() for keyword in activity_keywords):
                activity = {
                    'name': line,
                    'description': '',
                    'price': 'Price varies',
                    'hours': 'Check local timings',
                    'distance': 'Distance varies',
                    'transport': 'Multiple options',
                    'type': 'activity'
                }
                
                # Look for additional info in next few lines
                for j in range(i+1, min(i+3, len(lines))):
                    next_line = lines[j].strip()
                    if next_line and len(next_line) > 5:
                        activity['description'] += next_line + ' '
                
                activity['description'] = activity['description'][:150] + "..." if len(activity['description']) > 150 else activity['description']
                activities.append(activity)
                
                if len(activities) >= 10:
                    break
        
        return activities
    
    def _parse_itinerary_schedule(self, ai_output: str, trip_data: Dict, activities: List[Dict]) -> List[Dict]:
        """Parse AI-generated schedule into structured format"""
        schedule = []
        start_date = datetime.strptime(trip_data['start_date'], "%Y-%m-%d")
        
        try:
            # Improved parsing to handle various AI output formats
            cleaned_output = ai_output.replace('**', '').replace('*', '')
            
            # Try to split by day indicators
            day_patterns = ['Day ', 'day ', 'DAY ']
            day_sections = []
            
            for pattern in day_patterns:
                if pattern in cleaned_output:
                    day_sections = cleaned_output.split(pattern)
                    break
            
            # If no day patterns found, create basic schedule
            if not day_sections or len(day_sections) <= 1:
                return self._create_basic_schedule(trip_data, activities)
            
            # Create schedule with strict duplicate prevention
            return self._create_basic_schedule(trip_data, activities)
                
        except Exception as e:
            print(f"Error parsing AI schedule: {e}")
            return self._create_basic_schedule(trip_data, activities)
    
    def _create_basic_schedule(self, trip_data: Dict, activities: List[Dict]) -> List[Dict]:
        """Create schedule using pop-based approach: exactly 2 activities + 1 restaurant per day"""
        schedule = []
        start_date = datetime.strptime(trip_data['start_date'], "%Y-%m-%d")
        
        # Create working copies of the lists to pop from
        available_activities = activities.copy() if activities else []
        
        # Ensure we have enough items (should already be correct from search methods)
        duration = trip_data['duration']
        activities_needed = duration * 2
        
        # Add fallbacks if needed
        if len(available_activities) < activities_needed:
            fallback_activities = self._get_fallback_activities(
                trip_data['location'], 
                trip_data['budget'], 
                activities_needed - len(available_activities)
            )
            available_activities.extend(fallback_activities)
        
        print(f"📋 Creating schedule with {len(available_activities)} activities")
        
        for day in range(duration):
            current_date = start_date + timedelta(days=day)
            day_items = []
            
            # Pop exactly 2 activities for this day
            for _ in range(2):
                if available_activities:
                    activity = available_activities.pop(0)  # Remove from front of list
                    activity['type'] = 'activity'
                    day_items.append(activity)
                    print(f"   Day {day + 1}: Added activity '{activity.get('name', 'Unknown')}' (remaining: {len(available_activities)})")
            
            schedule.append({
                'day': day + 1,
                'date': current_date.strftime("%Y-%m-%d"),
                'activities': day_items,  # Contains exactly 2 activities
                'ai_suggestions': f"Day {day + 1}: Explore {trip_data['location']} with 2 unique activities"
            })
        
        # Log remaining items (should be empty)
        if available_activities:
            print(f"⚠️  {len(available_activities)} activities remaining unused")
        
        return schedule
    
    def _get_fallback_hotels(self, location: str, budget: str) -> List[Dict]:
        """Fallback hotels if AI search fails"""
        budget_desc = {
            'low': 'Budget-friendly accommodation',
            'medium': 'Comfortable mid-range hotel',
            'high': 'Luxury accommodation'
        }
        
        return [
            {
                'name': f'{budget.title()} Hotel {location}',
                'description': budget_desc[budget] + ' in the heart of the city',
                'price': 'Price information unavailable',
                'rating': 'Rating unavailable',
                'location': location
            }
        ]
    
    def _get_fallback_activities(self, location: str, budget: str, count: int = 1) -> List[Dict]:
        """Fallback activities if AI search fails"""
        activities = []
        activity_types = ['Museum', 'Park', 'Market', 'Gallery', 'Temple', 'Garden', 'Monument', 'Center']
        
        for i in range(count):
            activity_type = activity_types[i % len(activity_types)]
            activities.append({
                'name': f'{activity_type} in {location}',
                'description': f'Visit local {activity_type.lower()} within your {budget} budget',
                'price': 'Varies',
                'hours': 'Check local listings',
                'distance': 'Various locations',
                'transport': 'Multiple options',
                'type': 'activity'
            })
        
        return activities