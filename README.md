# GlobeTrotter 🌍

A modern, AI-powered travel planning application that helps users create personalized itineraries, discover destinations, and share their travel experiences with a community of fellow travelers.

## Video-link: https://drive.google.com/drive/folders/1pKhbqBcP0YMH3SpHrO9npTCskKRoDrNA?usp=sharing

## Features

### 🤖 AI-Powered Trip Planning
- **Intelligent Itinerary Generation**: Uses Google Gemini AI to create detailed day-by-day itineraries
- **Personalized Recommendations**: Get activity suggestions based on your destination, budget, and preferences
- **Flexible Planning**: Start with AI recommendations or build completely custom itineraries

### 🗺️ Destination Discovery
- **Comprehensive Database**: Browse 18+ curated destinations across all continents
- **Smart Filtering**: Filter by region (Asia, Europe, Americas, etc.) and price range (budget, mid-range, luxury)
- **Rich Information**: Each destination includes highlights, best time to visit, and pricing details

### 📅 Trip Management
- **Trip Dashboard**: Organize trips by status (upcoming, ongoing, completed)
- **Interactive Builder**: Add cities, activities, and manage your itinerary with drag-and-drop
- **Budget Tracking**: Automatic cost estimation for activities and trips
- **Timeline View**: Visual day-by-day trip timeline with activities

### 👥 Community Features
- **Trip Sharing**: Share your trips publicly with the community
- **Social Interaction**: Like and comment on other travelers' trips
- **Discovery**: Browse and get inspired by community-shared itineraries

### 🔐 User Management
- **Secure Authentication**: Email/password authentication with Supabase
- **User Profiles**: Customizable profiles with bio, location, and preferences
- **Settings**: Personalized notification and privacy settings

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time subscriptions** - Live updates for comments and likes
- **Row Level Security** - Secure data access patterns

### AI & APIs
- **Google Gemini AI** - Intelligent itinerary generation
- **Groq** - Fast AI inference for recommendations
- **Google Maps API** - Location services and mapping

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key
- Groq API key
- Google Maps API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd globetrotter
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key

   # Google Maps
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   \`\`\`

4. **Set up the database**
   Run the SQL scripts in the `scripts/` folder to create the necessary tables:
   \`\`\`bash
   # Run these scripts in your Supabase SQL editor
   scripts/00_extensions.sql
   scripts/01_schema.sql
   scripts/02_seed_example.sql
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Database Schema

The application uses the following main tables:

- **`trips`** - User trip data with itinerary information
- **`trip_stops`** - Cities/locations within trips
- **`activities`** - Individual activities within trip stops
- **`destinations`** - Curated destination database
- **`user_profiles`** - Extended user information
- **`trip_comments`** - Community comments on public trips
- **`trip_likes`** - User likes on public trips
- **`user_settings`** - User preferences and settings

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── community/         # Community features
│   ├── explore/           # Destination discovery
│   ├── p/[tripId]/        # Public trip pages
│   ├── profile/           # User profile
│   ├── settings/          # User settings
│   └── trips/             # Trip management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
├── scripts/              # Database setup scripts
└── public/               # Static assets
\`\`\`

## Key Features Walkthrough

### 1. **Explore Destinations**
Browse curated destinations with filtering by region and price range. Each destination includes beautiful imagery, highlights, and travel information.

### 2. **Create AI-Powered Itineraries**
Use the AI assistant to generate detailed day-by-day itineraries based on your preferences, or start with a blank timeline and add activities manually.

### 3. **Manage Your Trips**
View all your trips in an organized dashboard, edit itineraries with the interactive builder, and track your travel history.

### 4. **Community Sharing**
Share your favorite trips with the community, discover new destinations through other travelers' experiences, and engage through likes and comments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@globetrotter.com or join our community Discord server.

---

**Happy Traveling! ✈️**

