import React, { useEffect, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";



function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  // useEffect(() => {
  //   console.log("Updated photoUrl:", photoUrl);
  // }, [photoUrl]);

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

  const location = useLocation();

  const handleShare = async () => {
    const shareData = {
      title: `Trip Plan for ${trip?.userSelection?.place}`,
      text: `Check out my ${trip?.userSelection?.days}-day trip plan to ${trip?.userSelection?.place}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(
          shareData.text + " " + "at" + window.location.href
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  };

  return (
    <div>
    <div className="flex justify-center">
    <img
        src={photoUrl}
        key={photoUrl}
        className="h-[400px]  oject-contain rounded-xl transition-all hover:opacity-85"
        onError={(e) => {
        console.error("Image load failed:", e.target.src);
        
      }}
      />
    </div>
      

      <div className="flex justify-between items-center ">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">{trip?.userSelection?.place}</h2>
          <div className="flex gap-5">
            <h2 className="p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md">
              Days: {trip?.userSelection?.days}
            </h2>
            <h2 className="p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md">
              {" "}
              {trip?.userSelection?.budget}
            </h2>
            <h2 className="p-1 px-3  w-fit bg-green-400 rounded-full font-semibold text-xs md:text-md">
              {" "}
              {trip?.userSelection?.travelGroup}
            </h2>
          </div>
        </div>
        <Button
          className={
            "mt-5 bg-orange-500 text-white cursor-pointer hover:scale-105 hover:animate-bounce"
          }
          onClick={handleShare}
        >
          <IoIosSend />
          Share!
        </Button>
      </div>
    </div>
  );
}

export default InfoSection;
