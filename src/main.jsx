import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import { Toaster, toast } from 'sonner'
import { GoogleOAuthProvider } from "@react-oauth/google"
import ViewTrip from './view-trip/[tripId]'
import MyTrips from './my-trips'
import FavoriteTrips from './favorite-trips'

// Import new components
import Blogs from './blogs/index.jsx'
import BlogDetail from './blogs/[blogId]/index.jsx'
import CreateBlog from './blogs/create/index.jsx'
import EditBlog from './blogs/[blogId]/edit/index.jsx'
import Groups from './groups/index.jsx'
import GroupDetail from './groups/[groupId]/index.jsx'
import CreateGroup from './groups/create/index.jsx'
import Profile from './profile/index.jsx'
import UserProfile from './profile/[userId]/index.jsx'
import ActivityFeed from './activity/index.jsx'

// Global token expiration handler
const handleTokenExpiration = () => {
  localStorage.clear();
  toast.error('Session expired. Please login again.');
  window.location.href = '/';
};

// Add global event listener for token expiration
window.addEventListener('tokenExpired', handleTokenExpiration);

const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>
  },
  {
    path:'/create-trip',
    element:<CreateTrip/>
  },
  {
    path:'/view-trip/:tripId',
    element:<ViewTrip/>
  },
  {
    path:'/my-trips',
    element:<MyTrips/>
  },
  {
    path: "/favorite-trips",
    element: <FavoriteTrips />
  },
  // Blog routes
  {
    path: "/blogs",
    element: <Blogs />
  },
  {
    path: "/blogs/create",
    element: <CreateBlog />
  },
  {
    path: "/blogs/:blogId",
    element: <BlogDetail />
  },
  {
    path: "/blogs/:blogId/edit",
    element: <EditBlog />
  },
  // Group routes
  {
    path: "/groups",
    element: <Groups />
  },
  {
    path: "/groups/create",
    element: <CreateGroup />
  },
  {
    path: "/groups/:groupId",
    element: <GroupDetail />
  },
  // Profile routes
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/profile/:userId",
    element: <UserProfile />
  },
  // Activity feed
  {
    path: "/activity",
    element: <ActivityFeed />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <Header/>
    <Toaster/>
    <RouterProvider router={router}/>
  </GoogleOAuthProvider>
    
  </StrictMode>,
)
