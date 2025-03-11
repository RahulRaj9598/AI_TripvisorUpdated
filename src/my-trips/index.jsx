import { db } from '@/service/firebaseConfig';
import { collection, getDocs,where,query} from 'firebase/firestore';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import UserTripCardItem from './components/UserTripCardItem';

function MyTrips() {
  const navigate=useNavigate();
  const [userTrips,setUserTrips]=React.useState([]);
  useEffect(() => {
    GetUserTrips();
  }, []);


  // use to get user trips from firebase

  const GetUserTrips=async()=>{
    const user=JSON.parse(localStorage.getItem('user'));
    
    if(!user){
      navigate('/');
      return;
    }

    

    const q = query(collection(db, "AiTrips"), where("userEmail", "==", user?.email));

    const querySnapshot = await getDocs(q);
    setUserTrips([]);
    querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    setUserTrips(prevVal=>[...prevVal,doc.data()])
    });
  }
  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
     <h2 className='font-bold text-3xl'>My Trips</h2> 
     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5'>
      {userTrips?.length>0 ? userTrips.map((trip,index)=>(
        <UserTripCardItem trip={trip} key={index} className=""/>
      ))
      :[1,2,3,4,5,6].map((item,index)=>(
        <div key={index} className='h-[250px] w-full bg-slate-200 p-5 rounded-xl shadow-md animate-pulse'>

        </div>
      ))}
     </div>
    </div>
  )
}

export default MyTrips;
