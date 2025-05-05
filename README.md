# AiTrip - AI-Powered Travel Planner 🌎

AiTrip is a modern travel planning application that uses AI to generate personalized travel itineraries based on your preferences, budget, and schedule.

## 🌟 Features

- **AI-Powered Itineraries**: Generate custom travel plans using Google's Gemini AI
- **Google Places Integration**: Real-time location search and photo integration
- **User Authentication**: Secure Google OAuth2.0 authentication
- **Trip Management**: Create, save, and manage your trips
- **Favorites System**: Save your favorite trips for later
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live trip generation status
- **Share Functionality**: Share your trip plans with others

## 🚀 Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: TailwindCSS
- **Authentication**: Google OAuth2.0
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini API
- **Location Services**: Google Places API
- **UI Components**: Radix UI
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform Account
- Firebase Account

## 🔑 Required API Keys

Create a `.env` file in the root directory with the following:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_PLACE_API_KEY=your_google_places_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aitrip.git
cd aitrip
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── custom/
│   │   ├── Header.jsx
│   │   └── Hero.jsx
│   └── ui/
├── create-trip/
│   └── index.jsx
├── favorite-trips/
│   └── index.jsx
├── my-trips/
│   └── components/
│       └── UserTripCardItem.jsx
├── service/
│   ├── AiModel.jsx
│   ├── GlobalApi.jsx
│   └── firebaseConfig.js
└── view-trip/
    └── components/
```

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Set up Google Authentication
4. Add Firebase configuration to `firebaseConfig.js`

### Google Cloud Platform Setup

1. Create a new GCP project
2. Enable Places API
3. Create OAuth 2.0 credentials
4. Enable Gemini API

## 🎨 Features in Detail

### Trip Creation
- Select destination using Google Places Autocomplete
- Choose trip duration (up to 7 days)
- Select budget preference
- Specify travel group size

### Trip View
- Detailed day-wise itinerary
- Hotel recommendations
- Interactive maps integration
- Place details with photos
- Sharing functionality

### Trip Management
- Save trips to favorites
- View all created trips
- Delete unwanted trips
- Update trip status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Google Gemini AI
- Google Places API
- Firebase team
- React community