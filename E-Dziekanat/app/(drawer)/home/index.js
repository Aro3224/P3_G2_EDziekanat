import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { getDatabase, ref, set, query, orderByChild, equalTo, onValue, get } from "firebase/database";
import Timer from '../../../components/timer';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { getMessaging, getToken } from "firebase/messaging";
import { PageTitle, SubTitle } from '../../../components/styles';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const navigation = useNavigation();
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        setUserId(user?.uid || null)
        const path = 'users/'+ user?.uid;
        const snapshot = await get(ref(db, path));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(userData?.Imie || '');
        }
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (Platform.OS === 'web') {
          await handleWebToken(user);
        } else {
          await handleMobileToken(user);

          const unsubscribe = messaging().onMessage(async remoteMessage => {
            Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
          });

          return unsubscribe;
        }
      }
    });

    return () => {
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
                const czasOtrzymania = new Date(unreadNotificationsData[notificationId].czas).toLocaleString();
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
      const db = getDatabase();
      await set(ref(db, `users/${user.uid}/webtoken`), currentToken);
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
    return enabled;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <Drawer.Screen
        options={{
          title: "Strona główna",
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />
        }} />
      <PageTitle>{`Witaj ${userName || ''}!`}</PageTitle>
      <SubTitle>w E-dziekanacie</SubTitle>
      <Timer />
      <View style={styles.upperPanel}>
          <Text style={styles.sectionTitle}>Nieodczytane Powiadomienia:</Text>
          {unreadNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notificationItem
              ]}
              onPress={() => navigation.navigate('nextpage', { id: item.id })}
            >
              <Text style={styles.notificationTitle}>{item.tytul}</Text>
              <Text style={styles.notificationTime}>{item.czas}</Text>
            </TouchableOpacity>
          ))}
        </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  upperPanel: {
    width: '80%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  notificationItem: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
});
