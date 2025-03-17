import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";

function PlacesToVisit({trip}) {
  // Debug data structure
  // useEffect(() => {
  //   console.log('Trip data:', trip);
  // }, [trip]);


  const itineraryDays = trip?.tripData?.itineraryOptions ? 
    Object.entries(trip.tripData.itineraryOptions) : [];

  console.log("ItineraryDays:",itineraryDays.length)
    const [placePhotos, setPlacePhotos] = useState({});
    const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (trip?.tripData?.itineraryOptions) {
      GetPlacePhoto();
    }
  }, [trip]);
  
    // const GetPlacePhoto = async () => {
    //   try {
    //     setLoading(true);
    //     const data = {
    //       textQuery: `${hotel?.HotelName} ${hotel?.HotelAddress}`
    //     };
        
    //     const response = await GetPlaceDetails(data);
    //     console.log('API Response:', response); // Debug log
  
    //     if (response?.data?.places?.[0]?.photos?.[0]?.name) {
    //       const photoName = response.data.places[0].photos[0].name;
    //       const photoUrl = PHOTO_REF_URL.replace("NAME", photoName);
    //       setPhotoUrl(photoUrl);
    //     } else {
    //       console.log('No photo found for:', hotel?.HotelName); // Debug log
    //     }
    //   } catch (error) {
    //     console.error('Error fetching hotel photo:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    const GetPlacePhoto = async () => {
      try {
        setLoading(true);
        const allPlaces = Object.values(trip?.tripData?.itineraryOptions || {}).flatMap(day => 
          day.locations.map(location => ({
            placeName: location.placeName,
            location: trip?.tripData?.tripDetails?.location
          }))
        );
        console.log("allPlaces",allPlaces)
    
        for (const place of allPlaces) {
          try {
            const data = {
              textQuery: `${place.placeName} ${place.location}`
            };
            
            const response = await GetPlaceDetails(data);
    
            if (response?.data?.places?.[0]?.photos?.[0]?.name) {
              const photoName = response.data.places[0].photos[0].name;
              const photoUrl = PHOTO_REF_URL.replace("NAME", photoName);
              setPlacePhotos(prev => ({
                ...prev,
                [place.placeName]: photoUrl
              }));
            }
          } catch (error) {
            console.error(`Error fetching photo for ${place.placeName}:`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching place photos:', error);
      } finally {
        setLoading(false);
      }
    };

  // Directly access itineraryOptions from trip object
  
  if (!trip || !itineraryDays.length) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Places to Visit</h2>
        <div className="bg-orange-100 p-4 rounded-xl">
          <p className="text-orange-800">No itinerary available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Places to Visit</h2>
      <div className="space-y-8">
        {itineraryDays.map(([day, dayData], index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-orange-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white capitalize">
                {day}
              </h3>
              <p className="text-orange-100 mt-1">
                Best Time to Visit: {dayData.bestTimeToVisit}
              </p>
            </div>

            <div className="p-6">
              {dayData.locations && dayData.locations.map((location, idx) => (
                <Link 
                  key={idx}
                  to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${location.placeName},${trip?.tripData?.tripDetails?.location}`
                  )}`} 
                  target='_blank'
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="mb-8 last:mb-0">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image Section */}
                      <div className="w-full md:w-1/3">
                        <img 
                          src={placePhotos[location.placeName] } 
                          alt={location.placeName}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.jpeg';
                          }}
                        />
                      </div>

                      {/* Content Section */}
                      <div className="w-full md:w-2/3">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {location.placeName}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {location.PlaceDetails}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Pricing */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{location.ticketPricing}</span>
                          </div>

                          {/* Travel Time */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{location.travelTimeNext}</span>
                          </div>

                          {/* Time Span */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{location.timeSpan}</span>
                          </div>

                          {/* Location */}
                          {location.geoCoordinates && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-700">
                                {location.geoCoordinates.latitude.toFixed(4)}, {location.geoCoordinates.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  {idx < dayData.locations.length - 1 && (
                    <div className="border-b border-gray-200 my-8" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlacesToVisit


