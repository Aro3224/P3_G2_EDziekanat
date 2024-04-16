import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { auth, db } from '../../../components/configs/firebase-config'; // Importuj autentykację Firebase
import { getDatabase, ref, set } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";
import Timer from '../../../components/timer';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUserEmail(user.email);
          // Zapisz token web do bazy danych Firebase
          const messaging = getMessaging();
          const currentToken = await getToken(messaging, { vapidKey: "BLuGoqDsX7yuknK9LLcX5UONfv3pPC3cVhw-6CfEYCqeksICoLZMfs3tNGVGck0i7k6EVkrIFtKUOmn77afoaYk" });
          if (currentToken) {
            const db = getDatabase(); // Pobierz referencję do bazy danych
            await set(ref(db, `users/${user.uid}/webtoken`), currentToken); // Ustaw token web pod odpowiednim kluczem
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Dodaj nasłuchiwanie zmiany stanu autoryzacji użytkownika
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Uzyskaj nowy token web
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, { vapidKey: "BLuGoqDsX7yuknK9LLcX5UONfv3pPC3cVhw-6CfEYCqeksICoLZMfs3tNGVGck0i7k6EVkrIFtKUOmn77afoaYk" });
        if (currentToken) {
          const db = getDatabase(); // Pobierz referencję do bazy danych
          await set(ref(db, `users/${user.uid}/webtoken`), currentToken); // Ustaw token web pod odpowiednim kluczem
        }
      }
    });

    return () => {
      // Odsubskrybuj nasłuchiwanie zmiany stanu autoryzacji użytkownika przy odmontowywaniu komponentu
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Timer />
      <Drawer.Screen 
      options={{ 
        title:"Strona główna", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text>{`Witaj ${userEmail || ''}`}</Text>
      <Text>Tutaj pojawią się nieprzeczytane powiadomienia</Text>
      <Link href={"/(drawer)/home/nextpage"}>
        <Text>Przejdź do podstrony</Text>
      </Link>
    </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
})
