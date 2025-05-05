import React, { useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import * as Dialog from "@radix-ui/react-dialog";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "sonner";

function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [openDialog, setOpenDialog] = useState(false);
  useEffect(() => {
    console.log(user);
  }, [user]);

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
        
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        toast('Failed to get user profile');
        setOpenDialog(false);
        window.location.reload()
      });

  }

  return (
    <div className="sticky top-0 z-50">
      {/* Background with gradient and glass effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-orange-50 to-white opacity-80" />
      <div className="absolute inset-0 backdrop-blur-md" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Header content */}
      <div className="relative max-w-7xl mx-auto border-b border-orange-100">
        <div className="p-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <img src="/logo.svg" alt="AiTrip Logo" className="h-10 w-auto" />
          </a>
          
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <a href="/create-trip">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Trip
                    </span>
                  </Button>
                </a>
                
                <a href="/my-trips">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                      My Trips
                    </span>
                  </Button>
                </a>

                <a href="/favorite-trips">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Favorites
                    </span>
                  </Button>
                </a>

                <Popover>
                  <PopoverTrigger>
                    <div className="relative group">
                      <img
                        src={user?.picture || "/avatar.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-orange-400 cursor-pointer"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 rounded-xl shadow-lg border border-gray-100 bg-white">
                    <button 
                      onClick={() => {
                        googleLogout();
                        localStorage.clear();
                        window.location.reload('/');
                      }}
                      className="w-full px-4 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Button 
                onClick={() => setOpenDialog(true)}
                className="rounded-full px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] transition-all duration-300 cursor-pointer"
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Keep existing Dialog components unchanged */}
          <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 " />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px] z-[60]">
                <Dialog.Title className="text-xl font-bold text-center ">
                  Sign in with Google
                </Dialog.Title>
                <Dialog.Description className="flex flex-col items-center gap-4 py-6">
                  <img src="/logo.svg" alt="logo" className="w-20 h-20" />
                  <p className="text-center text-gray-500 font-semibold ">
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
        </div>
      </div>
    </div>
  );
}

export default Header;
