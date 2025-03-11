// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqe1_dgAe5UOcwkqEWHjc6AX5kn--p9Gk",
  authDomain: "trippyai-f9e0c.firebaseapp.com",
  projectId: "trippyai-f9e0c",
  storageBucket: "trippyai-f9e0c.firebasestorage.app",
  messagingSenderId: "811107567715",
  appId: "1:811107567715:web:103d45ffff02f802f49056",
  measurementId: "G-7MZKLWCCFZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
//const analytics = getAnalytics(app);