import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Platform, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { auth, db } from '../../../components/configs/firebase-config';
import { getDatabase, ref, set, query, orderByChild, equalTo, onValue } from "firebase/database";
import Timer from '../../../components/timer';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { getMessaging, getToken } from "firebase/messaging";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Dodaj nasłuchiwanie zmiany stanu autoryzacji użytkownika
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Uzyskaj nowy token
        if (Platform.OS === 'web') {
          await handleWebToken(user);
        } else {
          await handleMobileToken(user);

          // Rejestruj handler wiadomości push
          const unsubscribe = messaging().onMessage(async remoteMessage => {
            Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
          });

          return unsubscribe;
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
              const unreadNotificationsArray = [];
              Object.keys(unreadNotificationsData).forEach(notificationId => {
                const czasOtrzymania = new Date(unreadNotificationsData[notificationId].czas).toLocaleString(); // Formatuj czas na datę i godzinę
                const notification = {
                  id: notificationId,
                  ...unreadNotificationsData[notificationId],
                  czas: czasOtrzymania
                };
                unreadNotificationsArray.push(notification);
              });
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

  const handleMobileToken = async (user) => {
    const permissionGranted = await requestUserPermission();
    if (permissionGranted) {
      const token = await messaging().getToken();
      const db = getDatabase();
      await set(ref(db, `users/${user.uid}/mobtoken`), token);
    } else {
      console.log("User denied permission for notifications.");
    }
  };

  const handleWebToken = async (user) => {
    const messaging = getMessaging();
    const currentToken = await getToken(messaging, { vapidKey: "BLuGoqDsX7yuknK9LLcX5UONfv3pPC3cVhw-6CfEYCqeksICoLZMfs3tNGVGck0i7k6EVkrIFtKUOmn77afoaYk" });
    if (currentToken) {
      const db = getDatabase(); // Pobierz referencję do bazy danych
      await set(ref(db, `users/${user.uid}/webtoken`), currentToken); // Ustaw token web pod odpowiednim kluczem
    }
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled; // Return permission status
  };

  return (
    <View style={styles.container}>
      <Timer />
      <Drawer.Screen
        options={{
          title: "Strona główna",
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />
        }} />
      <Text>{`Witaj ${userEmail || ''}`}</Text>
      <View style={styles.notificationContainer}>
        <FlatList
          data={unreadNotifications}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{item.tytul}</Text>
              <Text style={styles.notificationTime}>{item.czas}</Text>
              <Link
                href={`/(drawer)/home/nextpage?id=${item.id}`}
                onPress={() => navigation.navigate('nextpage', { notificationContent: item.tresc })}
              >
                <Text style={styles.openButton}>Otwórz</Text>
              </Link>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
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
