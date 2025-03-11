import React from 'react'
import { Link } from 'react-router-dom'

function UserTripCardItem({trip}) {
  return (
    <Link to={`/view-trip/${trip?.id}`} className='bg-white p-5 rounded-xl shadow-md'>
    <div>
      <img src="/placeholder.jpeg" className='object-cover rounded-xl h-[250px]' />
      <div>
        <h2 className='font-bold text-lg'>{trip?.userSelection?.place}</h2>
        <h2>{trip?.userSelection?.days} Days trip with {trip?.userSelection?.budget} budget plans</h2>
      </div>
    </div>
    </Link>
  )
}

export default UserTripCardItem
