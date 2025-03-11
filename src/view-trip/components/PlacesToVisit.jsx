import React from 'react'
import { Link } from 'react-router-dom';

function PlacesToVisit({trip}) {
  const itineraryDays = trip?.tripData?.itinerary ? 
    Object.entries(trip.tripData.itinerary) : [];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Places to Visit</h2>
      <div className="space-y-8">
      
        {itineraryDays.map(([day, data], index) => (
          
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Day Header */}
            <div className="bg-orange-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white capitalize">
                {day} - {data.theme}
              </h3>
              <p className="text-orange-100 mt-1">
                Best Time to Visit: {data.bestTimeToVisit}
              </p>
            </div>

            {/* Activities */}
            <div className="p-6">
              {data.activities.map((activity, idx) => (
                <Link to={'https://www.google.com/maps/search/?api=1&query='+activity.placeName+","+trip?.tripData.location} target='_blank'>
                <div key={idx} className="mb-8 last:mb-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Section */}
                    {activity.placeImageUrl && (
                      <div className="w-full md:w-1/3">
                        <img 
                          src={activity.placeImageUrl || '/images.jpeg'} 
                          alt={activity.placeName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="w-full md:w-2/3">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {activity.placeName}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {activity.placeDetails}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pricing */}
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{activity.ticketPricing}</span>
                        </div>

                        {/* Travel Time */}
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{activity.travelTime}</span>
                        </div>

                        {/* Location */}
                        {activity.geoCoordinates && (
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700">
                              {activity.geoCoordinates.latitude.toFixed(4)}, {activity.geoCoordinates.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  {idx < data.activities.length - 1 && (
                    <div className="border-b border-gray-200 my-8" />
                  )}
                </div>
                </Link>
              ))}
            </div>
          </div>
          
          
        ))}
      </div>
    </div>
  )
}

export default PlacesToVisit