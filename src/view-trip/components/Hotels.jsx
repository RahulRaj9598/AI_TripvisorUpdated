import React from 'react'
import { Link } from 'react-router-dom'
function Hotels({trip}) {
  return (
    <div>
      <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
        {trip?.tripData?.hotels?.map((hotel,index)=>(
          <Link to={'https://www.google.com/maps/search/?api=1&query='+ hotel?.hotelName+","+ hotel?.hotelAddress} target='_blank' >
          <div key={index} className=' p-5 mt-5 rounded-lg cursor-pointer hover:shadow-lg transition-all  hover:scale-105 hover:bg-gray-200'>
          <img src="/public/placeholder.jpeg" className='rounded-xl' />
           <div className='my-2  '>
            <h2 className='font-medium'>{hotel?.hotelName}
            </h2>
            <h2 className='text-xs text-gray-500 '>📍{hotel?.hotelAddress}</h2>
            <h2 className='font-bold text-gray-500'>{hotel?.price}</h2>
            
            <h2 className='flex items-center gap-2 font-semibold'>{hotel?.rating}⭐</h2>
           </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Hotels
