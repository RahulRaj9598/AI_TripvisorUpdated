import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import { Toaster } from 'sonner'
import { GoogleOAuthProvider } from "@react-oauth/google"
import ViewTrip from './view-trip/[tripId]'
import MyTrips from './my-trips'
import FavoriteTrips from './favorite-trips'

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
