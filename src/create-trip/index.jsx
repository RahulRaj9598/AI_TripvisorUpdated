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
import { BlinkBlur } from "react-loading-indicators";

function CreateTrip() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog2,setOpenDialog2]=useState(false);
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

    if (formData?.days > 7) {
      toast("Days can't be more than 7");
      return;
    }
    

    console.log("AI_PROMPT:", AI_PROMPT);

    setLoading(true);
    setOpenDialog2(true);
    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData?.place)
      .replace("{totalDays}", formData?.days)
      .replace("{traveler}", formData?.travelGroup)
      .replace("{budget}", formData?.budget)
      // .replace("{totalDays}", formData?.days);


    const result = await chatSession.sendMessage(FINAL_PROMPT);
    console.log(result?.response?.text());
    setLoading(false);
    setOpenDialog2(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30 py-10 relative z-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
              Plan Your Perfect Trip
            </span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Let our AI assistant create a personalized itinerary based on your preferences
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-12">
            {/* Destination Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Choose Your Destination
                </h2>
              </div>
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
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      '&:hover': {
                        borderColor: '#f97316'
                      }
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

            {/* Duration Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📅</span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Trip Duration
                </h2>
              </div>
              <Input
                className="w-full rounded-xl border-gray-200 p-4 text-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Number of days (max 7)"
                type="number"
                min="1"
                max="7"
                value={formData.days}
                onChange={(e) => handleInputChange("days", e.target.value)}
              />
            </div>

            {/* Budget Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Your Budget
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SelectBudgetOptions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInputChange("budget", item.title)}
                    className={`group relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.budget === item.title
                        ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500"
                        : "bg-white border border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="relative z-10">
                      <span className="text-4xl mb-3 block">{item.icon}</span>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Travelers Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Travel Group
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SelectTravelesList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInputChange("travelGroup", item.people)}
                    className={`group relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.travelGroup === item.people
                        ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500"
                        : "bg-white border border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="relative z-10">
                      <span className="text-4xl mb-3 block">{item.icon}</span>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <Button
                disabled={loading}
                onClick={onGeneratetrip}
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
                ) : (
                  "Generate Your Perfect Trip ✨"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keep existing Dialog components unchanged */}
        <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px] z-[101]">
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
                    
                  className="w-full mt-5 bg-orange-500 text-white flex items-center gap-2 justify-center cursor-pointer"
                >
                
                  <FcGoogle /> Sign in With Google
                  
                </Button>
              </Dialog.Description>
              <Dialog.Close />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root open={openDialog2} onOpenChange={setOpenDialog2}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px] z-[101]">
              <Dialog.Title className="text-xl font-bold text-center">
                Trip is Being Generated 🚀
              </Dialog.Title>
              <Dialog.Description className="flex flex-col items-center gap-4 py-6">
                <img src="/logo.svg" alt="logo" className="w-20 h-20" />
                {/* <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin text-green-500 " />  */}

                <BlinkBlur color="#32cd32" size="medium" text="Planning the best Itinerary for you" textColor="Black" className=' translate-x-2' />
                
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
