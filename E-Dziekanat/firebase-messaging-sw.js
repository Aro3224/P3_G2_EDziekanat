// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyD7X-q4HjOYimyhcQR4ZOZmRpUbc3hmp4Y",
  authDomain: "e-dziekanat-4e60f.firebaseapp.com",
  databaseURL: "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "e-dziekanat-4e60f",
  storageBucket: "e-dziekanat-4e60f.appspot.com",
  messagingSenderId: "97660136861",
  appId: "1:97660136861:web:1a4962e330468b8e015374",
  measurementId: "G-ZZ7SCD4WMF"
};


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});