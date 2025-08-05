import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import { motion } from "framer-motion"
import { 
  MapPin, 
  Users, 
  FileText, 
  Heart, 
  Share2, 
  Edit3, 
  User, 
  Globe,
  Sparkles,
  MessageCircle,
  Camera,
  Star
} from 'lucide-react'

function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-orange-50 z-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="mx-auto max-w-7xl relative">
        <div className="relative pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
          >
            <div className="sm:text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 xl:inline">
                  Your Complete Travel Ecosystem
                </span>{' '}
                <span className="block xl:inline mt-2">AI-Powered Planning + Social Discovery</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg text-gray-600 max-w-3xl"
              >
                Experience the future of travel planning with AI-generated itineraries, share your adventures through blogs, 
                join travel communities, and connect with fellow explorers. Everything you need for your next journey in one place.
              </motion.p>

              {/* Feature Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* AI Trip Planning */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">AI Trip Planning</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Get personalized itineraries in seconds based on your budget, preferences, and schedule.</p>
                </div>

                {/* Travel Blogs */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Travel Blogs</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Share your adventures, read inspiring stories, and discover hidden gems from fellow travelers.</p>
                </div>

                {/* Travel Groups */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Travel Groups</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Join communities, discuss destinations, and find travel buddies for your next adventure.</p>
                </div>

                {/* User Profiles */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Rich Profiles</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Showcase your travel history, upload photos, and connect with other travelers.</p>
                </div>

                {/* Social Features */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Social Features</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Like, comment, share, and follow other travelers. Build your travel network.</p>
                </div>

                {/* Global Community */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Global Community</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Connect with travelers worldwide, discover new cultures, and expand your horizons.</p>
                </div>
              </motion.div>

              {/* Key Features List */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>AI-Powered Planning</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Blog Creation & Sharing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Travel Communities</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Photo Uploads</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Like & Comment System</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>User Profiles</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Follow System</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>Real-time Updates</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-12 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link to="/create-trip">
                  <Button className="group relative w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 px-8 text-lg font-medium text-white hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                    Start Planning Your Trip
                    <svg className="ml-2 -mr-1 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                
                <Link to="/blogs">
                  <Button variant="outline" className="group relative w-full sm:w-auto rounded-xl py-4 px-8 text-lg font-medium border-orange-600 text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-105">
                    Explore Travel Blogs
                    <MessageCircle className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/groups">
                  <Button variant="outline" className="group relative w-full sm:w-auto rounded-xl py-4 px-8 text-lg font-medium border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105">
                    Join Travel Groups
                    <Users className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.main>
          
          {/* Floating Elements */}
          <div className="absolute top-1/3 right-10 animate-float-slow">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full opacity-20"></div>
          </div>
          <div className="absolute bottom-1/4 left-10 animate-float-delayed">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20"></div>
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float-slow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Add scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
      >
        <div className="w-6 h-10 border-2 border-orange-400 rounded-full p-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto animate-scroll"></div>
        </div>
      </motion.div>
    </div>
  )
}

// Check icon component
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)

export default Hero