// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb6Y5K32Cp9Zjke9mrXjJyM4nsg2x48X0",
  authDomain: "vnr-speakup-portal-17d1a.firebaseapp.com",
  projectId: "vnr-speakup-portal-17d1a",
  storageBucket: "vnr-speakup-portal-17d1a.firebasestorage.app",
  messagingSenderId: "5299604231",
  appId: "1:5299604231:web:6a2044b03709cd492293a2",
  measurementId: "G-TB0K252MX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
