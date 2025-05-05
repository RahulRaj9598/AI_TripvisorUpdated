import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/service/firebaseConfig';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
function UserTripCardItem({trip,onDelete}) {
  
  const[photoUrl,setPhotoUrl]=useState(null);
  const [isFavorite, setIsFavorite] = useState(trip?.isFavorite || false);

  useEffect(() => {
      trip && GetPlacePhoto();
    }, [trip]);

  
    const GetPlacePhoto = async () => {
        const data = {
          textQuery: trip?.userSelection?.place,
        };
        const result = await GetPlaceDetails(data).then((resp) => {
          // console.log(resp.data.places[0]?.photos[3]?.name);
    
          const PhotoUrl = PHOTO_REF_URL.replace(
            "NAME",
            resp.data.places[0]?.photos[3]?.name
          );
          setPhotoUrl(PhotoUrl);
        });
      };

    const handleDelete=async()=>{
      const isConfirmed= window.confirm("Are you sure you want to delete this trip?");
      if(isConfirmed){
        await deleteDoc(doc(db,"AiTrips",trip?.id));
        onDelete(trip.id);
      }
    };

    const toggleFavorite = async (e) => {
      e.preventDefault(); // Prevent link navigation
      try {
        const tripRef = doc(db, "AiTrips", trip.id);
        await updateDoc(tripRef, {
          isFavorite: !isFavorite
        });
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      } catch (error) {
        console.error("Error updating favorite status:", error);
        toast.error("Failed to update favorite status");
      }
    };
    
  return (
    <div className='bg-white p-5 rounded-xl shadow-md relative '>
      <button 
        onClick={toggleFavorite}
        className="absolute top-7 right-7 z-10 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
      >
        {isFavorite ? (
          <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>
    
    <div>
    <Link to={`/view-trip/${trip?.id}`} >
      <img src={photoUrl}
        key={photoUrl} className='object-cover rounded-xl h-[300px] w-full hover:opacity-85 transition-all' />
    </Link>
      <div className='flex flex-col gap-2'>
        <h2 className='font-bold text-lg'>{trip?.userSelection?.place}</h2>
        <h2 className='text-sm font-semibold bg-green-400 w-fit p-1 rounded-md'>{trip?.userSelection?.days} Days trip </h2>
        <h2 className='text-sm font-semibold bg-green-400 w-fit p-1 rounded-md'>{trip?.userSelection?.budget} budget plans</h2>

        <Button 
        onClick={handleDelete}
        className=' right-2 bg-red-500 hover:bg-red-600 text-white rounded-md p-2  cursor-pointer'>
        Delete
        </Button>
      </div>
      
      
      
      
    </div>
    
    
    

    
    </div>
    
  )
}

export default UserTripCardItem
