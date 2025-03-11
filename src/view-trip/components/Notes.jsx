import React from 'react'

function Notes({trip}) {
  return (
    <div>
     <h2 className='text-lg font-bold'>📢 POINTS TO REMEMBER !</h2> 
     <div>
     
      {trip?.tripData?.notes.map((note,index)=>(
        <div key={index} className='bg-gray-200 p-3 my-3 rounded-lg shadow-md gap-5 hover:scale-105 transition-all cursor-pointer'>
        
        <h2 className='text-sm '>📌<strong>{index+1}.</strong> {note}</h2>
        </div>
      ))}
      <h5 className='text-xs text-gray-500'>*This is an AI-Generated Itinerary actual scenes might differ</h5>
     </div>
    </div>
  )
}

export default Notes
