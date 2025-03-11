import React, { useEffect, useState } from "react";
import GooglePlacesAutocomplete, { geocodeByAddress } from 'react-google-places-autocomplete';

import { Input } from "@/components/ui/input";
import { SelectBudgetOptions, SelectTravelesList } from "../constants/options";
import { Button } from "@/components/ui/button.jsx";
import { toast } from "sonner";
import { AI_PROMPT, chatSession } from "../service/AiModel";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { setDoc,doc } from "firebase/firestore";

import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function CreateTrip() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [formData, setFormData] = useState({
    place: "",
    days: "",
    budget: "",
    travelGroup: "",
  });
  const[loading,setLoading]=useState(false);

  const navigate=useNavigate();


  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePlaceSelect = async (place) => {
    setSelectedPlace(place);
    if (place) {
      // Store both the full place object and the formatted address
      handleInputChange("place", place.label);
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleSignIn = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Token Response:', tokenResponse);
      GetUserProfile(tokenResponse); 
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast('Google Sign In Failed');
    }
  });

  const onGeneratetrip = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (
      !formData?.days ||
      !formData?.budget ||
      !formData?.place ||
      !formData?.travelGroup
    ) {
      toast("Ensure all the fields are filled");
      return;
    }

    if (formData?.days > 5) {
      toast("Days can't be more than 5");
      return;
    }

    console.log("AI_PROMPT:", AI_PROMPT);

    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData?.place)
      .replace("{totalDays}", formData?.days)
      .replace("{traveler}", formData?.travelGroup)
      .replace("{budget}", formData?.budget)
      .replace("{totalDays}", formData?.days);


    const result = await chatSession.sendMessage(FINAL_PROMPT);
    console.log(result?.response?.text());
    setLoading(false);
    SaveAITrip(result?.response?.text())
  };

  const SaveAITrip=async (TripData)=>{
    setLoading(true);
    const user=JSON.parse(localStorage.getItem('user'));
    const docId=Date.now().toString()
    await setDoc(doc(db,"AiTrips",docId),{
      userSelection:formData,
      tripData:JSON.parse(TripData),
      userEmail:user?.email,
      id:docId
    });
    setLoading(false);
    navigate('/view-trip/'+docId)
  }


  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        console.log(resp);
        localStorage.setItem("user", JSON.stringify(resp?.data));
        setOpenDialog(false);
        setTimeout(() => {
          onGeneratetrip();
        }, 100);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        toast('Failed to get user profile');
        setOpenDialog(false);
      });

  }


  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
      <h2 className="font-bold text-3xl">Tell us your travel preferences</h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just Provide some information and our AI assitance will generate a
        itenary based on you preferences
      </p>

      <div className="mt-20 flex flex-col gap-10">
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is destination of choice?
          </h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              value: selectedPlace,
              onChange: handlePlaceSelect,
              placeholder: "Search for a destination...",
              isClearable: true,
              className: "border border-gray-300 rounded-md focus:outline-none ",
              styles: {
                control: (provided) => ({
                  ...provided,
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }),
                input: (provided) => ({
                  ...provided,
                  fontSize: '16px'
                }),
                option: (provided) => ({
                  ...provided,
                  cursor: 'pointer'
                })
              }
            }}
          />
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">
            How many days are you planning?
          </h2>
          <Input
            placeholder={"Ex.3"}
            type="number"
            min="1"
            max="4"
            value={formData.days}
            onChange={(e) => handleInputChange("days", e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">What is your budget?</h2>
          <div className="grid grid-cols-3 gap-5 mt-5 ">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg hover:shadow-lg cursor-pointer hover:text-orange-600 transition-transform hover:scale-105 ${
                  formData.budget === item.title
                    ? "border-green-500 text-green-600 bg-green-50"
                    : ""
                }`}
                onClick={() => handleInputChange("budget", item.title)}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">
            Who do you accompany with on you next Trip?
          </h2>
          <div className="grid grid-cols-3 gap-5 mt-5 ">
            {SelectTravelesList.map((item, index) => (
              <div
                key={item.id}
                className={`p-4  border rounded-lg hover:shadow-lg cursor-pointer hover:text-orange-600 transition-transform hover:scale-105 ${
                  formData.travelGroup === item.people
                    ? "border-green-500 text-green-600 bg-green-50"
                    : ""
                }`}
                onClick={() => handleInputChange("travelGroup", item.people)}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
        <div className="my-10 justify-end flex">
          <Button
          disabled={loading} 
          onClick={onGeneratetrip} 
          className="bg-orange-500 text-white cursor-pointer hover:bg-green-500 transition-all hover:scale-105">
          {loading ?
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin text-green-500 " /> : "Generate Trip"
          }
            
          </Button>
        </div>

<Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px]">
      <Dialog.Title className="text-xl font-bold text-center">
        Sign in with Google
      </Dialog.Title>
      <Dialog.Description className="flex flex-col items-center gap-4 py-6">
        <img src="/logo.svg" alt="logo" className="w-20 h-20" />
        <p className="text-center text-gray-500">
          Sign in to the App with Google Authentication
        </p>
        <Button
          onClick={handleSignIn}
            
          className="w-full mt-5 bg-orange-500 text-white flex items-center gap-2 justify-center"
        >
        
          <FcGoogle /> Sign in With Google
          
        </Button>
      </Dialog.Description>
      <Dialog.Close />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
      </div>
    </div>
  );
}

export default CreateTrip;
