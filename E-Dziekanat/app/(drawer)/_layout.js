import React, { useState, useEffect } from 'react';
import { Text, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { onAuthStateChanged, auth, db} from '../../components/configs/firebase-config';
import Login from '../../components/screens/Login';
import Ionicons from '@expo/vector-icons/Ionicons';
import { get, ref } from 'firebase/database';

export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setIsAuthenticated(true);
                fetchUserRole(user.uid);
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            const snapshot = await get(ref(db, `users/${userId}/Rola`));
            if (snapshot.exists()) {
                const role = snapshot.val();
                setUserRole(role);
            } else {
                console.error("Rola użytkownika nie istnieje");
            }
        } catch (error) {
            console.error('Błąd podczas pobierania roli użytkownika:', error);
        }
    }

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if(isAuthenticated){
      if(userRole === "Wykładowca"){
        return (
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
                name='sendmessage'
                options={{
                  drawerLabel: "Wyślij wiadomość",
                  title: "Wyślij wiadomość",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="mail" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='templates'
                options={{
                  drawerLabel: "Szablony powiadomień",
                  title: "Szablony powiadomień",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="reader-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='buttons'
                options={{
                  drawerLabel: "Przyciski",
                  title: "Przyciski",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="apps-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='filldata'
                options={{
                  drawerLabel: "Uzupełnij dane",
                  title: "Uzupełnij dane",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="pencil-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='users'
                options={{
                  drawerLabel: "Użytkownicy",
                  title: "Użytkownicy",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='groups'
                options={{
                  drawerLabel: "Grupy",
                  title: "Grupy",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="people-circle-outline" size={size} color={color} />
                }}
              />
            </Drawer>
        );
      } else if( userRole === "Pracownik" && Platform.OS === "web"){
        return ( 
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
        name='history'
        options={{
          drawerLabel: "Historia powiadomień",
          title: "Historia powiadomień",
          drawerIcon: ({ size, color }) => <Ionicons name="calendar-clear-outline" size={size} color={color} />
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
        name='filldata'
        options={{
          drawerLabel: "Uzupełnij dane",
          title: "Uzupełnij dane",
          drawerItemStyle: { display: 'none' },
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
      <Drawer.Screen
        name='settings'
        options={{
          drawerLabel: "Ustawienia",
          title: "Ustawienia",
          drawerIcon: ({ size, color }) => <Ionicons name="settings" size={size} color={color} />
        }}
      />
    </Drawer>
      );
      } else if(userRole === "Pracownik" && Platform.OS !== "web"){
        return (
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
                name='sendmessage'
                options={{
                  drawerLabel: "Wyślij wiadomość",
                  title: "Wyślij wiadomość",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="mail" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='templates'
                options={{
                  drawerLabel: "Szablony powiadomień",
                  title: "Szablony powiadomień",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="reader-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='buttons'
                options={{
                  drawerLabel: "Przyciski",
                  title: "Przyciski",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="apps-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='filldata'
                options={{
                  drawerLabel: "Uzupełnij dane",
                  title: "Uzupełnij dane",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="pencil-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='users'
                options={{
                  drawerLabel: "Użytkownicy",
                  title: "Użytkownicy",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />
                }}
              />
              <Drawer.Screen
                name='groups'
                options={{
                  drawerLabel: "Grupy",
                  title: "Grupy",
                  drawerItemStyle: { display: 'none' },
                  drawerIcon: ({ size, color }) => <Ionicons name="people-circle-outline" size={size} color={color} />
                }}
              />
            </Drawer>
        );
      }
    } else{
      return <Login />;
    }
}
