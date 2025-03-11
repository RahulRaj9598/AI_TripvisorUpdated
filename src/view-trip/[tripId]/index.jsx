import React, { useEffect ,useState} from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Notes from '../components/Notes';

function ViewTrip() {

  const {tripId}=useParams();
  const[trip,setTrip]=useState([]);
  useEffect(()=>{
    tripId && GetTripData();
  },[tripId])


  // use to get Trip info from firebase

  const GetTripData=async()=>{
    const docRef=doc(db,'AiTrips',tripId);
    const docSnap=await getDoc(docRef);

    if(docSnap.exists()){
      console.log("Documents",docSnap.data());
      setTrip(docSnap.data())
    }else{
      console.log("No such document");
      toast("No Trip Found")
    }
  }
  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56 '>
    {/* Information Section */}
    <InfoSection trip={trip} />
    {/* Recommended Hotels */}
    <Hotels trip={trip} />
    {/* Daily PLans */}
    <PlacesToVisit trip={trip}/>
    {/* Footer */}
    <Notes trip={trip}/>
    </div>
  )
}

export default ViewTrip
