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
        
        # Initialize Tavily search tool
        self.search_tool = TavilySearchResults(
            api_key=self.tavily_api_key,
            max_results=10,
            search_depth="advanced"
        )
        
        self.tools = [self.search_tool]
    
    def setup_agent(self):
        """Setup the LangChain agent"""
        # Create agent prompt template
        agent_prompt = PromptTemplate.from_template("""
You are a professional travel planning agent. Your job is to search the web for current, accurate information about hotels and activities for travel planning.

IMPORTANT RULES:
1. ONLY use information from web searches - do not hallucinate or make up data
2. Always search for current prices, ratings, and availability
3. Filter recommendations based on the specified budget range
4. Provide specific, actionable information with real names, addresses, and contact details when available
5. Include price ranges and ratings when found

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
    
    def get_user_input(self):
        """Get travel details from user"""
        print("=== AI-Powered Travel Itinerary Generator ===\n")
        
        location = input("Enter your destination: ").strip()
        start_date = input("Enter start date (YYYY-MM-DD): ").strip()
        end_date = input("Enter end date (YYYY-MM-DD): ").strip()
        
        # Get budget preference
        print("\nBudget Range Options:")
        print("1. Low - Budget-friendly options (under $100/night)")
        print("2. Medium - Mid-range comfort ($100-300/night)")
        print("3. High - Luxury and premium options ($300+/night)")
        
        budget_choice = input("Select budget range (1-3): ").strip()
        budget_map = {'1': 'low', '2': 'medium', '3': 'high'}
        budget = budget_map.get(budget_choice, 'medium')
        
        # Validate dates
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            if end <= start:
                raise ValueError("End date must be after start date")
        except ValueError as e:
            print(f"Invalid date format or range: {e}")
            return None
            
        return {
            'location': location,
            'start_date': start_date,
            'end_date': end_date,
            'duration': (end - start).days,
            'budget': budget
        }
    
    def display_hotel_choices(self, hotels: List[Dict]) -> Dict:
        """Display hotel options and let user choose"""
        print("\n" + "="*60)
        print("🏨 AVAILABLE HOTELS - Please choose your accommodation:")
        print("="*60)
        
        for i, hotel in enumerate(hotels, 1):
            print(f"\n{i}. {hotel.get('name', 'Hotel Name Unavailable')}")
            print(f"   📝 {hotel.get('description', 'No description available')[:150]}...")
            if hotel.get('price'):
                print(f"   💵 {hotel['price']}")
            if hotel.get('rating'):
                print(f"   ⭐ {hotel['rating']}")
            if hotel.get('location'):
                print(f"   📍 {hotel['location']}")
        
        while True:
            try:
                choice = input(f"\nSelect hotel (1-{len(hotels)}): ").strip()
                hotel_index = int(choice) - 1
                if 0 <= hotel_index < len(hotels):
                    selected_hotel = hotels[hotel_index]
                    print(f"\n✅ You selected: {selected_hotel.get('name', 'Selected Hotel')}")
                    return selected_hotel
                else:
                    print(f"Please enter a number between 1 and {len(hotels)}")
            except ValueError:
                print("Please enter a valid number")
    
    def search_hotels(self, location: str, checkin: str, checkout: str, budget: str) -> List[Dict]:
        """Search for hotels using AI agent with web search"""
        print(f"🤖 AI Agent searching for {budget} budget hotels in {location}...")
        
        query = f"""
        Search for hotels in {location} for dates {checkin} to {checkout} with {budget} budget range.
        
        Please format your response with clear sections for each hotel:
        
        HOTEL NAME: [Full hotel name]
        DESCRIPTION: [Brief description of the hotel]
        PRICE: [Price per night with currency]
        RATING: [Star rating or review score]
        LOCATION: [Full address or area]
        
        Find 5-6 hotels with current information including:
        - Hotel names and exact locations
        - Current price ranges per night
        - Star ratings and guest reviews
        - Amenities and features
        
        Filter for {budget} budget: 
        * Low budget: under $100/night, hostels, budget hotels
        * Medium budget: $100-300/night, 3-4 star hotels
        * High budget: $300+/night, luxury hotels, 5-star resorts
        
        Return only real hotel information from web search results.
        """
        
        try:
            result = self.agent_executor.invoke({"input": query})
            return self._parse_hotel_results(result['output'], location)
        except Exception as e:
            print(f"Error in AI hotel search: {e}")
            return self._get_fallback_hotels(location, budget)
    
    def search_activities(self, location: str, budget: str, duration: int, selected_hotel: Dict = None) -> List[Dict]:
        """Search for activities using AI agent with web search, focused around selected hotel"""
        hotel_info = ""
        if selected_hotel:
            hotel_name = selected_hotel.get('name', '')
            hotel_location = selected_hotel.get('location', '')
            hotel_info = f"near {hotel_name} at {hotel_location}" if hotel_location else f"near {hotel_name}"
        
        print(f"🤖 AI Agent searching for {budget} budget activities in {location} {hotel_info}...")
        
        query = f"""
        Search for current activities, attractions, and things to do in {location} for a {duration}-day trip with {budget} budget.
        {f"Focus on activities near or accessible from {hotel_name} located at {hotel_location}." if selected_hotel else ""}
        
        Please format your response with clear sections for each activity:
        
        ACTIVITY NAME: [Full activity/attraction name]
        DESCRIPTION: [Brief description of what visitors can expect]
        PRICE: [Admission cost or "Free" if no cost]
        HOURS: [Operating hours or schedule]
        DISTANCE: [Distance from hotel if applicable]
        TRANSPORT: [How to get there from hotel]
        
        Find 8-10 activities with specific information including:
        - Activity names and exact locations with addresses
        - Distance/travel time from the hotel if hotel location is provided
        - Current admission prices and costs
        - Operating hours and availability
        - Transportation options (walking, taxi, public transport)
        
        Filter for {budget} budget:
        * Low budget: free activities, parks, walking tours, under $20 activities
        * Medium budget: museums, paid tours, experiences $20-100
        * High budget: premium experiences, private tours, luxury activities $100+
        
        Include a mix of: cultural attractions, outdoor activities, food experiences, entertainment, shopping.
        Return only real, current information from web search results.
        """
        
        try:
            result = self.agent_executor.invoke({"input": query})
            return self._parse_activity_results(result['output'], location)
        except Exception as e:
            print(f"Error in AI activity search: {e}")
            return self._get_fallback_activities(location, budget)
    
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
        
        return hotels[:6] if hotels else self._get_fallback_hotels(location, 'medium')
    
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
        
        return activities[:12] if activities else self._get_fallback_activities(location, 'medium')
    
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
                    'transport': 'Multiple options available'
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
                'rating': 'Rating unavailable'
            }
        ]
    
    def _get_fallback_activities(self, location: str, budget: str) -> List[Dict]:
        """Fallback activities if AI search fails"""
        return [
            {
                'name': f'Explore {location}',
                'description': f'Discover the best of {location} within your {budget} budget',
                'price': 'Varies',
                'hours': 'Check local listings'
            }
        ] 
   
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
        
        Create a logical daily schedule considering:
        - Starting point is the selected hotel: {hotel_name}
        - Travel time and distance from hotel to activities
        - Opening hours and availability of attractions
        - Budget constraints for {trip_data['budget']} budget travelers
        - Mix of indoor/outdoor activities
        - Rest periods and meal times
        - Local transportation options
        - Efficient routing to minimize travel time
        
        Format as a day-by-day breakdown with morning, afternoon, and evening activities.
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
            
            # Remove empty first section
            if day_sections and not day_sections[0].strip():
                day_sections = day_sections[1:]
            
            for i in range(trip_data['duration']):
                current_date = start_date + timedelta(days=i)
                day_activities = []
                ai_suggestions = ""
                
                # Get day text if available
                if i < len(day_sections):
                    day_text = day_sections[i]
                    ai_suggestions = day_text[:300] + "..." if len(day_text) > 300 else day_text
                    
                    # Match activities mentioned in this day's text
                    for activity in activities:
                        activity_name = activity.get('name', '').lower()
                        if activity_name and any(word in day_text.lower() for word in activity_name.split() if len(word) > 3):
                            if activity not in day_activities:
                                day_activities.append(activity)
                
                # Ensure we have activities for each day
                if len(day_activities) < 2 and activities:
                    # Add activities that haven't been used yet
                    used_activities = [act for day in schedule for act in day.get('activities', [])]
                    remaining_activities = [a for a in activities if a not in used_activities and a not in day_activities]
                    
                    # Add remaining activities up to 3 per day
                    needed = min(3 - len(day_activities), len(remaining_activities))
                    day_activities.extend(remaining_activities[:needed])
                
                # If still not enough, cycle through all activities
                if len(day_activities) < 2 and activities:
                    start_idx = (i * 2) % len(activities)
                    for j in range(2 - len(day_activities)):
                        activity_idx = (start_idx + j) % len(activities)
                        if activities[activity_idx] not in day_activities:
                            day_activities.append(activities[activity_idx])
                
                schedule.append({
                    'day': i + 1,
                    'date': current_date.strftime("%Y-%m-%d"),
                    'activities': day_activities[:3],  # Max 3 activities per day
                    'ai_suggestions': ai_suggestions
                })
                
        except Exception as e:
            print(f"Error parsing AI schedule: {e}")
            return self._create_basic_schedule(trip_data, activities)
        
        return schedule
    
    def _create_basic_schedule(self, trip_data: Dict, activities: List[Dict]) -> List[Dict]:
        """Create basic schedule if AI parsing fails"""
        schedule = []
        start_date = datetime.strptime(trip_data['start_date'], "%Y-%m-%d")
        
        for day in range(trip_data['duration']):
            current_date = start_date + timedelta(days=day)
            day_activities = []
            
            if activities:
                start_idx = (day * 2) % len(activities)
                day_activities = activities[start_idx:start_idx + 2]
                if len(day_activities) < 2:
                    day_activities.append(activities[0])
            else:
                day_activities = [{'name': 'Explore the area', 'description': 'Discover local attractions'}]
            
            schedule.append({
                'day': day + 1,
                'date': current_date.strftime("%Y-%m-%d"),
                'activities': day_activities,
                'ai_suggestions': f"Explore {trip_data['location']} at your own pace"
            })
        
        return schedule
    
    def display_itinerary(self, itinerary: Dict):
        """Display the AI-generated itinerary in a formatted way"""
        print("\n" + "="*70)
        print(f"🤖 AI-POWERED TRAVEL ITINERARY FOR {itinerary['destination'].upper()}")
        print("="*70)
        print(f"📅 Travel Dates: {itinerary['dates']}")
        print(f"⏰ Duration: {itinerary['duration']}")
        print(f"💰 Budget Range: {itinerary['budget'].title()}")
        print(f"🔍 Generated by: {itinerary.get('generated_by', 'AI Agent')}")
        
        # Display selected hotel
        selected_hotel = itinerary.get('selected_hotel', {})
        print(f"\n🏨 YOUR SELECTED HOTEL:")
        print("-" * 50)
        print(f"✅ {selected_hotel.get('name', 'Selected Hotel')}")
        print(f"   📝 {selected_hotel.get('description', 'No description available')}")
        if selected_hotel.get('price'):
            print(f"   💵 {selected_hotel['price']}")
        if selected_hotel.get('rating'):
            print(f"   ⭐ {selected_hotel['rating']}")
        if selected_hotel.get('location'):
            print(f"   📍 {selected_hotel['location']}")
        
        print(f"\n🗓️ AI-OPTIMIZED DAILY ITINERARY (Activities near your hotel):")
        print("-" * 50)
        for day_plan in itinerary['daily_schedule']:
            print(f"\n📍 Day {day_plan['day']} - {day_plan['date']}")
            
            if day_plan.get('ai_suggestions'):
                print(f"🤖 AI Suggestions: {day_plan['ai_suggestions'][:200]}...")
                print()
            
            for i, activity in enumerate(day_plan['activities'], 1):
                print(f"   {i}. {activity.get('name', 'Activity')}")
                print(f"      � {activity.get('description', 'No description available')}")
                if activity.get('price'):
                    print(f"      � {activity['price']}")
                if activity.get('hours'):
                    print(f"      🕒 {activity['hours']}")
                if activity.get('distance'):
                    print(f"      📏 {activity['distance']}")
                if activity.get('transport'):
                    print(f"      🚌 {activity['transport']}")
                print()
        
        print("="*70)
        print("✈️ Your personalized itinerary is ready! Have an amazing trip!")
        print("🏨 Activities are optimized around your selected hotel")
        print("🔍 All recommendations based on real-time web data")
        print("="*70)
    
    def save_itinerary(self, itinerary, filename=None):
        """Save itinerary to JSON file"""
        if not filename:
            location = itinerary['destination'].replace(' ', '_').lower()
            filename = f"itinerary_{location}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(itinerary, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Itinerary saved to: {filename}")
        except Exception as e:
            print(f"Error saving itinerary: {e}")
    
    def run(self):
        """Main execution method"""
        try:
            print("🚀 Initializing AI Travel Agent...")
            
            # Get user input
            trip_data = self.get_user_input()
            if not trip_data:
                return
            
            print(f"\n🔍 AI Agent planning your {trip_data['duration']}-day {trip_data['budget']} budget trip to {trip_data['location']}...")
            
            # Search for hotels using AI agent
            hotels = self.search_hotels(
                trip_data['location'], 
                trip_data['start_date'], 
                trip_data['end_date'],
                trip_data['budget']
            )
            
            # Let user choose their preferred hotel
            if not hotels:
                print("❌ No hotels found. Please try again with different criteria.")
                return
                
            selected_hotel = self.display_hotel_choices(hotels)
            
            # Search for activities around the selected hotel
            activities = self.search_activities(
                trip_data['location'],
                trip_data['budget'],
                trip_data['duration'],
                selected_hotel
            )
            
            # Generate AI-optimized itinerary based on selected hotel
            itinerary = self.generate_itinerary(trip_data, selected_hotel, activities)
            
            # Display results
            self.display_itinerary(itinerary)
            
            # Ask if user wants to save
            save_choice = input("\nWould you like to save this AI-generated itinerary to a file? (y/n): ").lower()
            if save_choice in ['y', 'yes']:
                self.save_itinerary(itinerary)
            
        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user.")
        except Exception as e:
            print(f"An error occurred: {e}")
            print("Please check your API keys and internet connection.")

def main():
    """Entry point of the application"""
    print("🤖 Welcome to the AI-Powered Travel Itinerary Generator!")
    print("This tool uses advanced AI agents to search the web for real-time travel information.\n")
    
    generator = AITravelItineraryGenerator()
    generator.run()

if __name__ == "__main__":
    main()