import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { onAuthStateChanged, auth } from '../../components/configs/firebase-config';
import Login from '../../components/screens/Login';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
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

  return isAuthenticated ? (
    <Drawer screenOptions={{ headerShown: false, swipeEdgeWidth: 0 }}>
      <Drawer.Screen
        name='home'
        options={{
          drawerLabel: "Strona główna",
          title: "Strona główna",
          drawerIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='sendmessage'
        options={{
          drawerLabel: "Wyślij wiadomość",
          title: "Wyślij wiadomość",
          drawerIcon: ({ size, color }) => <Ionicons name="mail" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='templates'
        options={{
          drawerLabel: "Szablony powiadomień",
          title: "Szablony powiadomień",
          drawerIcon: ({ size, color }) => <Ionicons name="reader-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='buttons'
        options={{
          drawerLabel: "Przyciski",
          title: "Przyciski",
          drawerIcon: ({ size, color }) => <Ionicons name="apps-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='history'
        options={{
          drawerLabel: "Historia powiadomień",
          title: "Historia powiadomień",
          drawerIcon: ({ size, color }) => <Ionicons name="calendar-clear-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='settings'
        options={{
          drawerLabel: "Ustawienia",
          title: "Ustawienia",
          drawerIcon: ({ size, color }) => <Ionicons name="settings" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='filldata'
        options={{
          drawerLabel: "Uzupełnij dane",
          title: "Uzupełnij dane",
          drawerIcon: ({ size, color }) => <Ionicons name="pencil-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='users'
        options={{
          drawerLabel: "Użytkownicy",
          title: "Użytkownicy",
          drawerIcon: ({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name='groups'
        options={{
          drawerLabel: "Grupy",
          title: "Grupy",
          drawerIcon: ({ size, color }) => <Ionicons name="people-circle-outline" size={size} color={color} />
        }}
      />
    </Drawer>
  ) : <Login />;
}
