import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";

// Import routes
import userRoutes from "./routes/users.js";
import blogRoutes from "./routes/blogs.js";
import groupRoutes from "./routes/groups.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

// Using Google OAuth for authentication (no Firebase needed)

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// No need for local uploads directory - using Cloudinary for direct uploads

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

// Google Places API Proxy
app.post("/api/getPlaceDetails", async (req, res) => {
  try {
    const { textQuery } = req.body;
    
    if (!textQuery) {
      return res.status(400).json({ error: "Missing textQuery parameter" });
    }

    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      { textQuery },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "places.photos,places.displayName,places.id",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((error, req, res) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
