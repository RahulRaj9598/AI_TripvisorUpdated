import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {doc,deleteDoc} from 'firebase/firestore'
import { db } from '@/service/firebaseConfig';
import { Button } from '@/components/ui/button';

function UserTripCardItem({trip,onDelete}) {
  const[photoUrl,setPhotoUrl]=React.useState(null);

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
    
  return (
    <div className='bg-white p-5 rounded-xl shadow-md relative '>
    
    <div>
    <Link to={`/view-trip/${trip?.id}`} >
      <img src={photoUrl}
        key={photoUrl} className='object-cover rounded-xl h-[300px] w-full' />
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
