import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';


// Firebase configuration - hardcoded values for Lovable deployment with .env fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA6Ighi9Jq-ML4O2No5chCq-VYn5nTz5Zk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jimat-294609.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jimat-294609",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jimat-294609.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "552393042714",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:552393042714:web:1d7082f61bc30311821aa3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1000000000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Firebase messaging initialization failed:', error);
  }
}

export { messaging, getToken, onMessage }; 