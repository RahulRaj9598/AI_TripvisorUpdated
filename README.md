# 🌍 AI TripVisor

A comprehensive AI-powered travel platform that combines intelligent trip planning with social networking features. Generate personalized itineraries, share travel experiences through blogs, and connect with fellow travelers in dedicated groups.

## ✨ Features

### 🤖 AI Trip Planning
- **Smart Itinerary Generation** using Google Gemini 2.0 Flash AI
- **Personalized Recommendations** for hotels, attractions, and activities
- **Budget-aware Planning** with cost optimization
- **Day-by-day Scheduling** with optimal timing and travel routes
- **Multiple Traveler Types** support (solo, couple, family, group)

### 📝 Travel Blogging Platform
- **Rich Text Editor** for creating travel experiences
- **Multi-image Upload** with Cloudinary integration
- **Category & Tag System** for better organization
- **Like, Comment & Share** functionality
- **Advanced Search & Filtering** by destination, category, and content

### 👥 Social Travel Groups
- **Create & Join Groups** based on travel interests
- **Group Discussions** with real-time interactions
- **Event Planning** for upcoming trips
- **Admin Management** with role-based permissions
- **Category-based Discovery** (adventure, luxury, budget, etc.)

### 🔐 User Profiles & Social Features
- **Comprehensive Profiles** with travel preferences
- **Follow/Unfollow System** to connect with travelers
- **Activity Feed** to see updates from followed users
- **Social Links Integration** (Instagram, Twitter, Facebook, LinkedIn)
- **Travel Statistics** and achievements

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js & Express.js** - Server runtime and framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication tokens
- **Multer** - File upload handling
- **Cloudinary** - Image storage and optimization

### AI & APIs
- **Google Gemini 2.0 Flash** - AI trip generation
- **Google Places API** - Location services
- **Google OAuth 2.0** - User authentication
- **Firebase** - User management and real-time features

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud Console account
- Cloudinary account
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-tripvisor.git
   cd ai-tripvisor
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Environment Setup

1. **Frontend Environment** (`.env`)
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_PLACE_API_KEY=your_google_places_api_key
   ```

2. **Backend Environment** (`backend/.env`)
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tripvisor
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## 📱 Application Structure

```
AI_Tripvisor/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route components
│   ├── services/           # API and external service integrations
│   ├── utils/              # Helper functions
│   └── assets/             # Static assets
├── backend/
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication & validation
│   └── utils/              # Backend utilities
└── public/                 # Static files
```

## 🔗 API Endpoints

### Authentication
- `POST /api/users/auth` - User authentication
- `PUT /api/users/profile` - Update user profile

### Blogs
- `GET /api/blogs` - Get all blogs with filtering
- `POST /api/blogs` - Create new blog post
- `GET /api/blogs/:id` - Get specific blog
- `POST /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/comments` - Add comment

### Groups
- `GET /api/groups` - Get all travel groups
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/discussions` - Create discussion

## 🎨 UI Components

The application uses a modern, responsive design with:
- **Mobile-first approach** for optimal mobile experience
- **Dark/Light theme support** with system preference detection
- **Accessible components** built with Radix UI primitives
- **Smooth animations** using Framer Motion
- **Consistent design tokens** with Tailwind CSS

## 🔒 Security Features

- **JWT-based authentication** with secure token management
- **Firebase Admin SDK** for user verification
- **Input validation** and sanitization
- **File upload restrictions** with type and size limits
- **Protected routes** requiring authentication
- **CORS configuration** for secure cross-origin requests

## 📸 Screenshots

### AI Trip Planning
Generate detailed itineraries with hotel recommendations, daily schedules, and budget optimization.

### Travel Blogs
Share your travel experiences with rich media support and community engagement.

### Travel Groups
Connect with like-minded travelers and plan group adventures.




⭐ **Star this repository** if you found it helpful!
