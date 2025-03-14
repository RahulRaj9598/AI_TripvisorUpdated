import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function HotelCardItem({ hotel }) {


  const [photoUrl,setPhotoUrl]=useState(null);
      
    // useEffect(() => {
    //   console.log("Updated photoUrl:", photoUrl);
    // }, [photoUrl]);
  
  
    useEffect(()=>{
      hotel && GetPlacePhoto();
    },[hotel])
  
    const GetPlacePhoto=async()=>{
  
      
      const data={
        textQuery:hotel?.hotelName
      }
      const result = await GetPlaceDetails(data).then(resp=>{
      //  console.log(resp.data.places[0]?.photos[4]?.name);
  
       const PhotoUrl=PHOTO_REF_URL.replace("NAME",resp.data.places[0]?.photos[3]?.name);
       setPhotoUrl(PhotoUrl);
      });
    }

  return (
    <Link
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        hotel?.hotelName +
        "," +
        hotel?.hotelAddress
      }
      target="_blank"
    >
      <div className=" p-5 mt-5 rounded-lg cursor-pointer hover:shadow-lg transition-all  hover:scale-105 hover:bg-gray-200">
        <img src={photoUrl}  key={photoUrl} className="rounded-xl h-[180px] w-full object-cover" />
        <div className="my-2  ">
          <h2 className="font-medium">{hotel?.hotelName}</h2>
          <h2 className="text-xs text-gray-500 ">📍{hotel?.hotelAddress}</h2>
          <h2 className="font-bold text-gray-500">{hotel?.price}</h2>

          <h2 className="flex items-center gap-2 font-semibold">
            {hotel?.rating}⭐
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default HotelCardItem;
