import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotel?.HotelName) {
      GetPlacePhoto();
    }
  }, [hotel]);

  const GetPlacePhoto = async () => {
    try {
      setLoading(true);
      const data = {
        textQuery: `${hotel?.HotelName} ${hotel?.HotelAddress}`
      };
      
      const response = await GetPlaceDetails(data);
      console.log('API Response:', response); // Debug log

      if (response?.data?.places?.[0]?.photos?.[0]?.name) {
        const photoName = response.data.places[0].photos[0].name;
        const photoUrl = PHOTO_REF_URL.replace("NAME", photoName);
        setPhotoUrl(photoUrl);
      } else {
        console.log('No photo found for:', hotel?.HotelName); // Debug log
      }
    } catch (error) {
      console.error('Error fetching hotel photo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug log
  console.log('Hotel Data:', hotel);

  if (!hotel) {
    return null; // Don't render if no hotel data
  }

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${hotel?.HotelName}, ${hotel?.HotelAddress}`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block" // Added to ensure proper link rendering
    >
      <div className="p-5 mt-5 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:bg-gray-200">
        {loading ? (
          <div className="rounded-xl h-[180px] w-full bg-gray-200 animate-pulse" />
        ) : (
          <img
            src={photoUrl || '/placeholder-hotel.jpg'}
            alt={hotel?.HotelName}
            className="rounded-xl h-[180px] w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-hotel.jpg';
            }}
          />
        )}
        <div className="my-2">
          <h2 className="font-medium">{hotel?.HotelName}</h2>
          <h2 className="text-xs text-gray-500">📍{hotel?.HotelAddress}</h2>
          <h2 className="font-bold text-gray-500">{hotel?.Price}</h2>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{hotel?.rating}</span>
            <span>⭐</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{hotel?.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;