import { Text } from 'react-native';
import { onAuthStateChanged, auth } from '../components/configs/firebase-config';
import Login from '../components/screens/Login';
import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
    if (isLoading) {
      return <Text>Loading...</Text>;
    }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return isAuthenticated ? <Redirect href={"/(drawer)/home"}/> : <Login onLoginSuccess={handleLoginSuccess} />;
}
