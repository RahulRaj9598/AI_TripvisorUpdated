import React from 'react'
import {Button} from "@/components/ui/button"
import { Link } from 'react-router-dom'
function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>
      <h1 className='font-extrabold text-[50px] text-center mt-16 '>
       <span className='text-orange-600'>Discover Your Next Adventure with AI:</span> Personalized Iternaries
      </h1>
      <p className='text-xl text-gray-500 text-center'>Discover the perfect itinerary in seconds! Our AI-powered trip planner customizes your travel experience based on your preferences, budget, and schedule. Whether you're exploring hidden gems or must-see attractions, let smart recommendations make your journey seamless and unforgettable. Start planning today! 🚀</p>
      <Link to={'/create-trip'}>
      <Button className='bg-orange-600 text-white cursor-pointer'>Get Started, It's Free</Button>
      </Link>
      
    </div>
  )
}

export default Hero
