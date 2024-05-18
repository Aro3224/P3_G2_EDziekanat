import React, { useState, useEffect } from 'react';
import { Platform, Text } from 'react-native';
import { onAuthStateChanged, auth, db } from '../components/configs/firebase-config';
import Login from '../components/screens/Login';
import { Redirect } from 'expo-router';
import { ref, get } from "firebase/database";
import Notif_Mobile from '../components/Notif_Mobile';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isFirstTimeLoggedIn, setIsFirstTimeLoggedIn] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const fetchUserData = async () => {
          try {
            const path = 'users/' + user.uid;
            const snapshot = await get(ref(db, path));
            if (snapshot.exists()) {
              const userData = snapshot.val();
              if (userData?.IsFirstTimeLoggedIn === false || userData?.IsFirstTimeLoggedIn == null || userData?.NrTelefonu == null || userData?.Imie == null || userData?.Nazwisko == null) {
                setIsFirstTimeLoggedIn(false);
                setIsAuthenticated(true);
              } else {
                setIsFirstTimeLoggedIn(true);
                setIsAuthenticated(true);
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        fetchUserData();
        
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  console.log("isAuthenticated:", isAuthenticated);
  console.log("isFirstTimeLoggedIn:", isFirstTimeLoggedIn);

  if(Platform.OS !=='web'){
    Notif_Mobile();
  }
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated == true){
    if(isFirstTimeLoggedIn == true){
      return (<Redirect href={"/(drawer)/home"}/>)
    } else {
      return (<Redirect href={"/(drawer)/filldata"}/>)
    }
  } else{
    return <Login />;
  }
}
