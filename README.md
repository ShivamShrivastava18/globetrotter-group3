# 🤖 AI-Powered Travel Itinerary Generator

An intelligent travel planning application that uses AI agents to search the web for real-time hotel and activity information, then generates personalized itineraries based on your budget and preferences.

## ✨ Features

- **AI-Powered Web Search**: Uses Google Gemini 2.0 Flash with Tavily search for real-time data
- **Budget-Aware Recommendations**: Filters hotels and activities by budget range
- **Interactive Hotel Selection**: Choose from AI-scraped hotel options
- **Location-Optimized Activities**: Recommends activities around your selected hotel
- **Smart Itinerary Generation**: Creates logical daily schedules with travel considerations
- **Web Interface**: Simple Streamlit UI for easy interaction
- **Export Options**: Save itineraries as JSON files

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup API Keys
Create a `.env` file with your API keys:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Get API Keys:**
- Google Gemini API: https://aistudio.google.com/app/apikey
- Tavily API: https://tavily.com/

### 3. Run the Application

**Web Interface (Recommended):**
```bash
streamlit run streamlit_app.py
```

**Command Line Interface:**
```bash
python travel_itinerary_generator.py
```

## 💰 Budget Ranges

- **Low Budget**: Under $100/night hotels, free-$20 activities
- **Medium Budget**: $100-300/night hotels, $20-100 activities  
- **High Budget**: $300+ luxury hotels, $100+ premium experiences

## 🎯 How It Works

1. **Enter Trip Details**: Destination, dates, and budget preference
2. **AI Hotel Search**: Agent searches web for hotels matching your criteria
3. **Select Hotel**: Choose from real hotel options with prices and ratings
4. **Activity Discovery**: AI finds activities around your selected hotel
5. **Smart Itinerary**: Generates optimized daily schedule with travel considerations
6. **Export & Save**: Download your personalized itinerary

## 🛠️ Technology Stack

- **LangChain**: Agent orchestration and workflow management
- **Google Gemini**: Advanced AI with Gemini 2.0 Flash model
- **Tavily**: Real-time web search and data extraction
- **Streamlit**: Simple and intuitive web interface
- **Python**: Core application logic

## 📱 Web Interface Features

- **Step-by-Step Wizard**: Guided process from search to itinerary
- **Progress Tracking**: Visual progress indicator in sidebar
- **Responsive Design**: Works on desktop and mobile devices
- **Real-Time Updates**: Live feedback during AI processing
- **Export Options**: Download itineraries as JSON files

## 🔧 Configuration

The application automatically loads configuration from `.env` file. Make sure to set:

- `GEMINI_API_KEY`: Your Google Gemini API key for LLM access
- `TAVILY_API_KEY`: Your Tavily API key for web search

## 📄 Example Output

The AI generates comprehensive itineraries including:
- Selected hotel with pricing and location details
- Daily activity schedules optimized around your hotel
- Transportation suggestions between locations
- Operating hours and admission prices
- Distance and travel time estimates

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## 📝 License

This project is open source and available under the MIT License.