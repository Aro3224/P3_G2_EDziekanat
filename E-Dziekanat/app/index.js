import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { onAuthStateChanged, auth, db } from '../components/configs/firebase-config';
import Login from '../components/screens/Login';
import { Redirect } from 'expo-router';
import { ref, get } from "firebase/database";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isDataInBase, setIsDataInBase] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const fetchUserData = async () => {
          try {
            const path = 'users/' + user.uid;
            const snapshot = await get(ref(db, path));
            if (snapshot.exists()) {
              const userData = snapshot.val();
              if (userData?.NrTelefonu == null || userData?.Imie == null || userData?.Nazwisko == null) {
                setIsDataInBase(false);
                setIsAuthenticated(true);
              } else {
                setIsDataInBase(true);
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
  console.log("isDataInBase:", isDataInBase);
  
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
    if(isDataInBase == true){
      return (<Redirect href={"/(drawer)/home"}/>)
    } else {
      return (<Redirect href={"/(drawer)/filldata"}/>)
    }
  } else{
    return <Login />;
  }
}
