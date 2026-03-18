import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDywG1bDLoGtxbED6n4_ojrNjZZvyZyWd0",
  authDomain: "sistema-contable-eb460.firebaseapp.com",
  projectId: "sistema-contable-eb460",
  storageBucket: "sistema-contable-eb460.firebasestorage.app",
  messagingSenderId: "413581090852",
  appId: "1:413581090852:web:75a314afbb3024b399b8b1",
  measurementId: "G-F6W49NY50V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
