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
    <div className="p-3 shadow-sm flex justify-between items-center px-5">
      <img src="/logo.svg" alt="" />
      <div>
        {user ? (
          <div className="flex items-center gap-3">
          <a href="/create-trip">
            <Button variant={"outline"} className={"rounded-full cursor-pointer hover:bg-orange-500 hover:text-white hover:shadow-lg transition-all"}>
              + Create Trips
            </Button>
            </a>
          <a href="/my-trips">
            <Button variant={"outline"} className={"rounded-full cursor-pointer hover:bg-orange-500 hover:text-white hover:shadow-lg transition-all"}>
              My Trips
            </Button>
            </a>
            <Popover>
              <PopoverTrigger>
              <img
              src={user?.picture || "/avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
              </PopoverTrigger>
              <PopoverContent className={'hover:bg-orange-400 cursor-pointer font-bold hover:text-white'}>
                <h2 className="cursor-pointer " onClick={()=>{
                  googleLogout();
                  localStorage.clear();
                  window.location.reload('/');
                }}>Logout</h2>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button className= 'cursor-pointer bg-black text-white' onClick={()=>setOpenDialog(true)}>Sign in</Button>
        )}
      </div>
      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px]">
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
  );
}

export default Header;
