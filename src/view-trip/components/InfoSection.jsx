import React from 'react'
import {IoIosSend} from "react-icons/io"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLocation } from 'react-router-dom'

function InfoSection({trip}) {

  const location =useLocation();

  const handleShare= async()=>{
    const shareData={
      title:`Trip Plan for ${trip?.userSelection?.place}`,
      text:`Check out my ${trip?.userSelection?.days}-day trip plan to ${trip?.userSelection?.place}!`,
      url:window.location.href
    }
  

  try {
    if (navigator.share) {
      // Use native share if available
      await navigator.share(shareData);
      toast.success('Shared successfully!');
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(shareData.text+" "+ "at"+ window.location.href);
      toast.success('Link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    toast.error('Failed to share');
  }
};


  return (
    <div>
      <img src="/public/placeholder.jpeg" className='h-[340px] w-full object-cover rounded-xl ' />

      <div className='flex justify-between items-center '>
      <div className='my-5 flex flex-col gap-2'>
        <h2 className='font-bold text-2xl'>{trip?.userSelection?.place}</h2>
        <div className='flex gap-5'>
          <h2 className='p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md'>Days: {trip?.userSelection?.days}</h2>
          <h2 className='p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md'> {trip?.userSelection?.budget}</h2>
          <h2 className='p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md'> {trip?.userSelection?.travelGroup}</h2>
        </div>
      </div>
      <Button className={'mt-5 bg-orange-500 text-white cursor-pointer hover:scale-105 hover:animate-bounce'} onClick={handleShare}><IoIosSend/>Share!</Button>
      </div>
      
    </div>
  )
}

export default InfoSection
