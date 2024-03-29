import { Text } from 'react-native';
import { app } from '../components/configs/firebase-config';
import Login from '../components/screens/Login';
import { Redirect } from 'expo-router';
import { useState } from 'react';

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return isAuthenticated ? <Redirect href={"/(drawer)/home"}/> : <Login onLoginSuccess={handleLoginSuccess} />;
}
