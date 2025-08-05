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
import { 
  Plus, 
  Heart, 
  Users, 
  User, 
  Activity,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function Header() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [openDialog, setOpenDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Function to clear user data and redirect to login
  const clearUserAndRedirect = () => {
    localStorage.clear();
    setUser(null);
    toast.error('Session expired. Please login again.');
  };

  // Function to check if token is valid
  const checkTokenValidity = async (token) => {
    try {
      // For our JWT tokens, we can check if they're expired by decoding them
      // JWT tokens are self-contained and don't need external validation
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (userData && token) {
        try {
          // First check if token is still valid
          const isTokenValid = await checkTokenValidity(token);
          if (!isTokenValid) {
            console.log('Token is invalid, clearing localStorage');
            clearUserAndRedirect();
            return;
          }

          const parsedUser = JSON.parse(userData);
          if (parsedUser._id && parsedUser._id !== 'undefined') {
            const response = await fetch(`http://localhost:3001/api/users/${parsedUser._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data);
              // Update localStorage with the latest data
              localStorage.setItem("user", JSON.stringify(data));
            } else if (response.status === 401) {
              // Token expired or invalid
              console.log('Token expired, clearing localStorage');
              clearUserAndRedirect();
            } else {
              // Other error, fallback to localStorage data
              console.log('Error fetching user data, using localStorage fallback');
              setUser(parsedUser);
            }
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to localStorage data
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            clearUserAndRedirect();
          }
        }
      }
    };
    
    fetchUserData();
    
    // Set up an interval to refresh user data every 30 seconds
    const interval = setInterval(fetchUserData, 30000);
    
    // Listen for profile update events
    const handleProfileUpdate = () => {
      fetchUserData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

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

  const GetUserProfile = async (tokenInfo) => {
    try {
      // First get Google user info
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "application/json",
          },
        }
      );

      console.log('Google user data:', googleResponse.data);

      // Store Google data temporarily
      localStorage.setItem("user", JSON.stringify(googleResponse.data));
      localStorage.setItem("token", tokenInfo?.access_token);

      // Now authenticate with our backend to create/get user
      const authResponse = await fetch('http://localhost:3001/api/users/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenInfo?.access_token}`
        }
      });

      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('Backend user data:', userData);
        
        // Store our JWT token instead of Google access token
        if (userData.jwtToken) {
          localStorage.setItem("token", userData.jwtToken);
          // Remove jwtToken from userData before storing
          const { jwtToken: _, ...userDataWithoutToken } = userData;
          localStorage.setItem("user", JSON.stringify(userDataWithoutToken));
          setUser(userDataWithoutToken);
        } else {
          // Fallback to storing the full user data
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
        
        setOpenDialog(false);
        toast.success('Successfully signed in!');
        window.location.reload(); // Reload to update all components
      } else {
        const errorData = await authResponse.json();
        console.error('Backend authentication failed:', errorData);
        
        if (errorData.code === 'TOKEN_EXPIRED') {
          toast.error('Session expired. Please try logging in again.');
          localStorage.clear();
        } else {
          toast.error('Authentication failed. Please try again.');
        }
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error in authentication flow:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please try logging in again.');
        localStorage.clear();
      } else {
        toast.error('Authentication failed. Please check your connection and try again.');
      }
      setOpenDialog(false);
    }
  }

  // Navigation items for mobile menu
  const navigationItems = [
    { href: "/create-trip", icon: Plus, label: "Create Trip" },
    { href: "/my-trips", icon: "bookmark", label: "My Trips" },
    { href: "/favorite-trips", icon: Heart, label: "Favorites" },
    { href: "/blogs", icon: "document", label: "Blogs" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/activity", icon: Activity, label: "Activity" },
  ];

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
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Trip Planning */}
                <a href="/create-trip">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
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
                      <Heart className="w-4 h-4" />
                      Favorites
                    </span>
                  </Button>
                </a>

                {/* Social Features */}
                <a href="/blogs">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Blogs
                    </span>
                  </Button>
                </a>

                <a href="/groups">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Groups
                    </span>
                  </Button>
                </a>

                <a href="/activity">
                  <Button 
                    variant={"outline"} 
                    className="rounded-full px-6 py-2 bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Activity
                    </span>
                  </Button>
                </a>

                <Popover>
                  <PopoverTrigger>
                    <div className="relative group">
                      <img
                        src={user?.displayPhotoURL || user?.picture || "/avatar.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-orange-400 cursor-pointer"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpeg';
                        }}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 rounded-xl shadow-lg border border-gray-100 bg-white w-48">
                    <div className="space-y-1">
                      <a href="/profile">
                        <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                      </a>
                      <a href="/blogs/create">
                        <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          Write Blog
                        </button>
                      </a>
                      <a href="/groups/create">
                        <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer">
                          <Users className="w-4 h-4" />
                          Create Group
                        </button>
                      </a>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => {
                          googleLogout();
                          localStorage.clear();
                          window.location.reload('/');
                        }}
                        className="w-full px-4 py-2 text-left rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
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

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <Popover>
                <PopoverTrigger>
                  <div className="relative group">
                    <img
                      src={user?.displayPhotoURL || user?.picture || "/avatar.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-orange-400 cursor-pointer"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpeg';
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-2 rounded-xl shadow-lg border border-gray-100 bg-white w-40">
                  <div className="space-y-1">
                    <a href="/profile">
                      <button className="w-full px-3 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer text-sm">
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                    </a>
                    <a href="/blogs/create">
                      <button className="w-full px-3 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer text-sm">
                        <Plus className="w-4 h-4" />
                        Write Blog
                      </button>
                    </a>
                    <a href="/groups/create">
                      <button className="w-full px-3 py-2 text-left rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center gap-2 cursor-pointer text-sm">
                        <Users className="w-4 h-4" />
                        Create Group
                      </button>
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        googleLogout();
                        localStorage.clear();
                        window.location.reload('/');
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-orange-50 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && user && (
          <div className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur-sm">
            <div className="p-4 space-y-2">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {item.icon === "bookmark" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  ) : item.icon === "document" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sign In Button */}
        {!user && (
          <div className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur-sm">
            <div className="p-4">
              <Button 
                onClick={() => setOpenDialog(true)}
                className="w-full rounded-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] transition-all duration-300 cursor-pointer"
              >
                Sign in
              </Button>
            </div>
          </div>
        )}

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
  );
}

export default Header;
