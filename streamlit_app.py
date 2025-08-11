#!/usr/bin/env python3
"""
Streamlit UI for AI-Powered Travel Itinerary Generator
A simple web interface for the travel planning application.
"""

import streamlit as st
import json
from datetime import datetime, timedelta
from travel_itinerary_generator import AITravelItineraryGenerator

# Configure Streamlit page
st.set_page_config(
    page_title="AI Travel Itinerary Generator",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .hotel-card {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
        background-color: #f9f9f9;
    }
    .activity-card {
        border-left: 4px solid #1f77b4;
        padding: 1rem;
        margin: 0.5rem 0;
        background-color: #f0f8ff;
    }
    .day-header {
        background-color: #e6f3ff;
        padding: 0.5rem;
        border-radius: 5px;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

def initialize_session_state():
    """Initialize session state variables"""
    if 'step' not in st.session_state:
        st.session_state.step = 1
    if 'trip_data' not in st.session_state:
        st.session_state.trip_data = None
    if 'hotels' not in st.session_state:
        st.session_state.hotels = []
    if 'selected_hotel' not in st.session_state:
        st.session_state.selected_hotel = None
    if 'activities' not in st.session_state:
        st.session_state.activities = []
    if 'itinerary' not in st.session_state:
        st.session_state.itinerary = None
    if 'generator' not in st.session_state:
        try:
            st.session_state.generator = AITravelItineraryGenerator()
        except Exception as e:
            st.error(f"Failed to initialize AI generator: {e}")
            st.error("Please check your .env file contains valid GEMINI_API_KEY and TAVILY_API_KEY")
            st.stop()

def step1_user_input():
    """Step 1: Get user travel details"""
    st.markdown('<h1 class="main-header">🤖 AI Travel Itinerary Generator</h1>', unsafe_allow_html=True)
    
    st.markdown("### 📝 Enter Your Travel Details")
    
    col1, col2 = st.columns(2)
    
    with col1:
        destination = st.text_input("🌍 Destination", placeholder="e.g., Tokyo, Japan")
        start_date = st.date_input("📅 Start Date", min_value=datetime.now().date())
    
    with col2:
        budget = st.selectbox("💰 Budget Range", 
                             options=["low", "medium", "high"],
                             format_func=lambda x: {
                                 "low": "💵 Low - Budget-friendly (under $100/night)",
                                 "medium": "💳 Medium - Mid-range ($100-300/night)", 
                                 "high": "💎 High - Luxury ($300+/night)"
                             }[x])
        end_date = st.date_input("📅 End Date", min_value=start_date)
    
    if st.button("🔍 Search Hotels", type="primary", use_container_width=True):
        if not destination:
            st.error("Please enter a destination")
            return
        
        if end_date <= start_date:
            st.error("End date must be after start date")
            return
        
        duration = (end_date - start_date).days
        
        st.session_state.trip_data = {
            'location': destination,
            'start_date': start_date.strftime("%Y-%m-%d"),
            'end_date': end_date.strftime("%Y-%m-%d"),
            'duration': duration,
            'budget': budget
        }
        
        # Search for hotels
        with st.spinner("🤖 AI Agent searching for hotels..."):
            try:
                hotels = st.session_state.generator.search_hotels(
                    destination, 
                    start_date.strftime("%Y-%m-%d"),
                    end_date.strftime("%Y-%m-%d"),
                    budget
                )
                st.session_state.hotels = hotels
                st.session_state.step = 2
                st.rerun()
            except Exception as e:
                st.error(f"Error searching hotels: {e}")

def step2_hotel_selection():
    """Step 2: Let user select hotel"""
    st.markdown('<h1 class="main-header">🏨 Select Your Hotel</h1>', unsafe_allow_html=True)
    
    trip_data = st.session_state.trip_data
    st.info(f"📍 {trip_data['location']} | 📅 {trip_data['start_date']} to {trip_data['end_date']} | 💰 {trip_data['budget'].title()} Budget")
    
    if not st.session_state.hotels:
        st.error("No hotels found. Please try different search criteria.")
        if st.button("🔙 Back to Search"):
            st.session_state.step = 1
            st.rerun()
        return
    
    st.markdown("### Choose your preferred accommodation:")
    
    # Display hotel options
    for i, hotel in enumerate(st.session_state.hotels):
        with st.container():
            st.markdown(f'<div class="hotel-card">', unsafe_allow_html=True)
            
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f"**🏨 {hotel.get('name', 'Hotel Name Unavailable')}**")
                st.write(f"📝 {hotel.get('description', 'No description available')[:200]}...")
                
                if hotel.get('price'):
                    st.write(f"💵 {hotel['price']}")
                if hotel.get('rating'):
                    st.write(f"⭐ {hotel['rating']}")
                if hotel.get('location'):
                    st.write(f"📍 {hotel['location']}")
            
            with col2:
                if st.button(f"Select Hotel", key=f"hotel_{i}", type="primary"):
                    st.session_state.selected_hotel = hotel
                    
                    # Search for activities around selected hotel
                    with st.spinner("🤖 AI Agent searching for activities around your hotel..."):
                        try:
                            activities = st.session_state.generator.search_activities(
                                trip_data['location'],
                                trip_data['budget'],
                                trip_data['duration'],
                                hotel
                            )
                            st.session_state.activities = activities
                            st.session_state.step = 3
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error searching activities: {e}")
            
            st.markdown('</div>', unsafe_allow_html=True)
    
    if st.button("🔙 Back to Search"):
        st.session_state.step = 1
        st.rerun()

def step3_generate_itinerary():
    """Step 3: Generate and display itinerary"""
    st.markdown('<h1 class="main-header">🗓️ Your AI-Generated Itinerary</h1>', unsafe_allow_html=True)
    
    if not st.session_state.itinerary:
        with st.spinner("🤖 AI Agent generating your personalized itinerary..."):
            try:
                itinerary = st.session_state.generator.generate_itinerary(
                    st.session_state.trip_data,
                    st.session_state.selected_hotel,
                    st.session_state.activities
                )
                st.session_state.itinerary = itinerary
            except Exception as e:
                st.error(f"Error generating itinerary: {e}")
                return
    
    itinerary = st.session_state.itinerary
    
    # Display trip summary
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("📍 Destination", itinerary['destination'])
    with col2:
        st.metric("⏰ Duration", itinerary['duration'])
    with col3:
        st.metric("💰 Budget", itinerary['budget'].title())
    
    # Display selected hotel
    st.markdown("### 🏨 Your Selected Hotel")
    selected_hotel = itinerary.get('selected_hotel', {})
    
    with st.container():
        st.markdown(f'<div class="hotel-card">', unsafe_allow_html=True)
        st.markdown(f"**✅ {selected_hotel.get('name', 'Selected Hotel')}**")
        st.write(f"📝 {selected_hotel.get('description', 'No description available')}")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            if selected_hotel.get('price'):
                st.write(f"💵 {selected_hotel['price']}")
        with col2:
            if selected_hotel.get('rating'):
                st.write(f"⭐ {selected_hotel['rating']}")
        with col3:
            if selected_hotel.get('location'):
                st.write(f"📍 {selected_hotel['location']}")
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Display daily itinerary
    st.markdown("### 🗓️ Daily Itinerary")
    
    for day_plan in itinerary['daily_schedule']:
        st.markdown(f'<div class="day-header"><h4>📍 Day {day_plan["day"]} - {day_plan["date"]}</h4></div>', unsafe_allow_html=True)
        
        if day_plan.get('ai_suggestions'):
            st.info(f"🤖 AI Suggestions: {day_plan['ai_suggestions'][:200]}...")
        
        for i, activity in enumerate(day_plan['activities'], 1):
            with st.container():
                st.markdown(f'<div class="activity-card">', unsafe_allow_html=True)
                st.markdown(f"**{i}. {activity.get('name', 'Activity')}**")
                st.write(f"📝 {activity.get('description', 'No description available')}")
                
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    if activity.get('price'):
                        st.write(f"💵 {activity['price']}")
                with col2:
                    if activity.get('hours'):
                        st.write(f"🕒 {activity['hours']}")
                with col3:
                    if activity.get('distance'):
                        st.write(f"📏 {activity['distance']}")
                with col4:
                    if activity.get('transport'):
                        st.write(f"🚌 {activity['transport']}")
                
                st.markdown('</div>', unsafe_allow_html=True)
    
    # Download option
    st.markdown("### 💾 Save Your Itinerary")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("📄 Download as JSON", type="secondary", use_container_width=True):
            json_str = json.dumps(itinerary, indent=2, default=str)
            st.download_button(
                label="💾 Download Itinerary",
                data=json_str,
                file_name=f"itinerary_{itinerary['destination'].replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
    
    with col2:
        if st.button("🔄 Plan Another Trip", type="primary", use_container_width=True):
            # Reset session state
            for key in ['step', 'trip_data', 'hotels', 'selected_hotel', 'activities', 'itinerary']:
                if key in st.session_state:
                    del st.session_state[key]
            st.rerun()

def main():
    """Main Streamlit application"""
    initialize_session_state()
    
    # Sidebar with progress
    with st.sidebar:
        st.markdown("### 🚀 Progress")
        
        steps = ["📝 Trip Details", "🏨 Select Hotel", "🗓️ View Itinerary"]
        
        for i, step_name in enumerate(steps, 1):
            if st.session_state.step == i:
                st.markdown(f"**➡️ {step_name}**")
            elif st.session_state.step > i:
                st.markdown(f"✅ {step_name}")
            else:
                st.markdown(f"⏳ {step_name}")
        
        st.markdown("---")
        st.markdown("### ℹ️ About")
        st.markdown("This AI-powered tool uses real-time web data to create personalized travel itineraries based on your budget and preferences.")
        
        if st.session_state.trip_data:
            st.markdown("### 📊 Trip Summary")
            st.write(f"📍 **Destination:** {st.session_state.trip_data['location']}")
            st.write(f"📅 **Dates:** {st.session_state.trip_data['start_date']} to {st.session_state.trip_data['end_date']}")
            st.write(f"⏰ **Duration:** {st.session_state.trip_data['duration']} days")
            st.write(f"💰 **Budget:** {st.session_state.trip_data['budget'].title()}")
    
    # Main content based on current step
    if st.session_state.step == 1:
        step1_user_input()
    elif st.session_state.step == 2:
        step2_hotel_selection()
    elif st.session_state.step == 3:
        step3_generate_itinerary()

if __name__ == "__main__":
    main()