// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";
import { Platform } from "react-native";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7X-q4HjOYimyhcQR4ZOZmRpUbc3hmp4Y",
  authDomain: "e-dziekanat-4e60f.firebaseapp.com",
  databaseURL: "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "e-dziekanat-4e60f",
  storageBucket: "e-dziekanat-4e60f.appspot.com",
  messagingSenderId: "97660136861",
  appId: "1:97660136861:web:1a4962e330468b8e015374",
  measurementId: "G-ZZ7SCD4WMF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize database
const db = getDatabase(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
if (Platform.OS === 'web') {
  messaging = getMessaging(app);
  getToken(messaging, {vapidKey: "BLuGoqDsX7yuknK9LLcX5UONfv3pPC3cVhw-6CfEYCqeksICoLZMfs3tNGVGck0i7k6EVkrIFtKUOmn77afoaYk"})
    .then((currentToken) => {
      if (currentToken) {
        console.log('Firebase Cloud Messaging token:', currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    })
    .catch((err) => {
      console.error('An error occurred while retrieving token:', err);
    });
}

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { db, auth, messaging };
