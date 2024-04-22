import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { auth, db } from '../../../components/configs/firebase-config'; // Importuj autentykację Firebase
import { getDatabase, ref, set, query, orderByChild, equalTo, onValue } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";
import Timer from '../../../components/timer';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

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

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const dbRef = ref(db, `notifications/${user.uid}/`);
          const unreadNotificationsQuery = query(dbRef, orderByChild('odczytano'), equalTo(false));
          onValue(unreadNotificationsQuery, (snapshot) => {
            const unreadNotificationsData = snapshot.val();
            if (unreadNotificationsData) {
              const unreadNotificationsArray = Object.values(unreadNotificationsData);
              setUnreadNotifications(unreadNotificationsArray);
            } else {
              setUnreadNotifications([]);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
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
      <View style={styles.notificationContainer}>
        <View style={styles.notificationFrame}>
          {unreadNotifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{notification.tytul}</Text>
            </View>
          ))}
        </View>
      </View>
      <Link href={"/(drawer)/home/nextpage"}>
        <Text>Przejdź do podstrony</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  notificationFrame: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  notificationItem: {
    backgroundColor: "#eee",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
