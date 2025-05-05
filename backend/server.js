import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Allow JSON body parsing

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

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
