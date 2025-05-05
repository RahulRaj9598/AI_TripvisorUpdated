// import React from 'react'
// import {Button} from "@/components/ui/button"
// import { Link } from 'react-router-dom'
// function Hero() {
//   return (
//     <div className='flex flex-col items-center mx-56 gap-9'>
//       <h1 className='font-extrabold text-[50px] text-center mt-16 '>
//        <span className='text-orange-600'>Discover Your Next Adventure with AI:</span> Personalized Iternaries
//       </h1>
//       <p className='text-xl text-gray-500 text-center'>Discover the perfect itinerary in seconds! Our AI-powered trip planner customizes your travel experience based on your preferences, budget, and schedule. Whether you're exploring hidden gems or must-see attractions, let smart recommendations make your journey seamless and unforgettable. Start planning today! 🚀</p>
//       <Link to={'/create-trip'}>
//       <Button className='bg-orange-600 text-white cursor-pointer hover:bg-green-500 transition-all hover:scale-105'>Get Started, It's Free</Button>
//       </Link>
      
//     </div>
//   )
// }

// export default Hero

// import React from 'react'
// import { Button } from "@/components/ui/button"
// import { Link } from 'react-router-dom'

// function Hero() {
//   return (
//     <div className="relative overflow-hidden bg-white">
//       <div className="mx-auto max-w-7xl">
//         <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
//           <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
//             <div className="sm:text-center lg:text-left">
//               <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
//                 <span className="block text-orange-600 xl:inline">Discover Your Next Adventure</span>{' '}
//                 <span className="block xl:inline">with AI-Powered Travel Planning</span>
//               </h1>
//               <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
//                 Create personalized itineraries in seconds! Our AI customizes your perfect trip based on:
//               </p>
//               <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-8">
//                 <div className="flex items-center space-x-2">
//                   <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span className="text-gray-600">Your Budget</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span className="text-gray-600">Time Frame</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                   </svg>
//                   <span className="text-gray-600">Preferences</span>
//                 </div>
//               </div>
//               <div className="mt-8 sm:mt-12">
//                 <Link to="/create-trip">
//                   <Button className="group relative w-full sm:w-auto rounded-md bg-orange-600 py-3 px-8 text-base font-medium text-white hover:bg-green-500 transition-all duration-300 hover:scale-105 hover:shadow-lg">
//                     Get Started, It's Free
//                     <svg className="ml-2 -mr-1 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                     </svg>
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </main>
          
//           {/* Decorative blob */}
//           <div className="absolute inset-y-0 right-0 w-1/2 opacity-50">
//             <svg className="h-56 w-full text-orange-100 sm:h-72 md:h-96" fill="currentColor" viewBox="0 0 100 100">
//               <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0ZM50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10Z"/>
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Hero





import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import { motion } from "framer-motion"

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
                  Discover Your Next Adventure
                </span>{' '}
                <span className="block xl:inline mt-2">with AI-Powered Travel Planning</span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-wrap gap-4 sm:justify-center lg:justify-start"
              >
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h3 className="font-semibold">Smart Planning</h3>
                    <p className="text-sm text-gray-600">AI-powered itineraries</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                  <span className="text-4xl">⚡</span>
                  <div>
                    <h3 className="font-semibold">Instant Results</h3>
                    <p className="text-sm text-gray-600">Plans in seconds</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                  <span className="text-4xl">🎨</span>
                  <div>
                    <h3 className="font-semibold">Personalized</h3>
                    <p className="text-sm text-gray-600">Tailored to you</p>
                  </div>
                </div>
              </motion.div> 

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-12 sm:flex sm:justify-center lg:justify-start"
              >
                <Link to="/create-trip">
                  <Button className="group relative w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 px-8 text-lg font-medium text-white hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                    Start Your Journey
                    <svg className="ml-2 -mr-1 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 sm:mt-0 sm:ml-4"
                >
                  <a href="#how-it-works" className="inline-flex items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors">
                    Learn More
                  </a>
                </motion.div>
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

export default Hero