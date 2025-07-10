import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCb6Y5K32Cp9Zjke9mrXjJyM4nsg2x48X0",
  authDomain: "vnr-speakup-portal-17d1a.firebaseapp.com",
  projectId: "vnr-speakup-portal-17d1a",
  storageBucket: "vnr-speakup-portal-17d1a.appspot.com",
  messagingSenderId: "5299604231",
  appId: "1:5299604231:web:857b6efb82f6079f2293a2",
  measurementId: "G-62SCFBLKQ7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
