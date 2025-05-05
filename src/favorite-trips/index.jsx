import { db } from '@/service/firebaseConfig';
import { collection, getDocs, where, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UserTripCardItem from '../my-trips/components/UserTripCardItem';

function FavoriteTrips() {
  const navigate = useNavigate();
  const [favoriteTrips, setFavoriteTrips] = useState([]);

  useEffect(() => {
    GetFavoriteTrips();
  }, []);

  const GetFavoriteTrips = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if(!user) {
      navigate('/');
      return;
    }

    const q = query(
      collection(db, "AiTrips"), 
      where("userEmail", "==", user?.email),
      where("isFavorite", "==", true)
    );

    const querySnapshot = await getDocs(q);
    setFavoriteTrips([]);
    querySnapshot.forEach((doc) => {
      setFavoriteTrips(prevVal => [...prevVal, { ...doc.data(), id: doc.id }]);
    });
  }

  const handleTripDeleted = (deletedTripId) => {
    setFavoriteTrips(favoriteTrips.filter((trip) => trip.id !== deletedTripId));
  }

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>Favorite Trips</h2> 
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5'>
        {favoriteTrips?.length > 0 ? favoriteTrips.map((trip, index) => (
          <UserTripCardItem 
            trip={trip} 
            key={index} 
            onDelete={handleTripDeleted}
          />
        )) : [1,2,3,4,5,6].map((item, index) => (
          <div key={index} className='h-[250px] w-full bg-slate-200 p-5 rounded-xl shadow-md animate-pulse' />
        ))}
      </div>
    </div>
  )
}

export default FavoriteTrips;