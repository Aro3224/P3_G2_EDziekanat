import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, Alert, TouchableOpacity, ScrollView, FlatList,Pressable } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { getDatabase, ref, set, query, orderByChild, equalTo, onValue, get } from "firebase/database";
import Timer from '../../../components/timer';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { getMessaging, getToken } from "firebase/messaging";
import { PageTitle, SubTitle } from '../../../components/styles';

const fetchNotifications = async (isAdmin) => {
  try {
    const userId = auth.currentUser.uid;
    let notificationsData = [];

    if (isAdmin) {
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        const userIds = Object.keys(users);

        for (const uid of userIds) {
          const userNotificationsRef = ref(db, `notifications/${uid}`);
          const userNotificationsSnapshot = await get(userNotificationsRef);

          if (userNotificationsSnapshot.exists()) {
            const userNotifications = userNotificationsSnapshot.val();
            const notificationsWithUser = Object.entries(userNotifications)
              .filter(([_, notification]) => notification.nowaOdpowiedz === true)
              .map(([notificationId, notification]) => ({
                id: notificationId,
                ...notification,
                userId: uid,
                userData: users[uid]
              }));
            notificationsData.push(...notificationsWithUser);
          }
        }
      }
    } else {
      const notificationsRef = ref(db, `notifications/${userId}/`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const fetchedNotificationsData = snapshot.val();
        const notificationsArray = Object.entries(fetchedNotificationsData)
          .filter(([_, notification]) => notification.odczytano === false)
          .map(([notificationId, notification]) => ({
            id: notificationId,
            ...notification
          }));
        notificationsData = notificationsArray;
      }
    }

    return notificationsData;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};



export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);
  const navigation = useNavigation();
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);

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
          if (userData?.IsFirstTimeLoggedIn === false || userData?.IsFirstTimeLoggedIn == null || userData?.NrTelefonu == null || userData?.Imie == null || userData?.Nazwisko == null) {
            setRedirect(true);
          } else {
            setRedirect(false);
          }
          const userRole = userData?.Rola;
          if (userRole === 'Pracownik') {
          setIsAdmin(true);
          } else {
          setIsAdmin(false);
          }
          setRoleLoaded(true);
          
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
            //Alert.alert(JSON.stringify(remoteMessage.notification.title), JSON.stringify(remoteMessage.notification.body));
          });

          return unsubscribe;
        }
      }
    });

    return () => {
      unsubscribe();
    };
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

  if (redirect) {
    if(Platform.OS =='web'){
        const link = document.createElement('a');
        link.href = "/(drawer)/filldata";
        link.click();
    }{
        navigation.navigate('filldata');
    }
}


useEffect(() => {
  const loadNotifications = async () => {
    try {
      if (!roleLoaded) {
        return;
      }
      const notificationsData = await fetchNotifications(isAdmin);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  loadNotifications();
}, [isAdmin, roleLoaded]);


const renderNotificationItem = ({ item }) => {
  const notificationDate = new Date(item.czas).toLocaleString();
  const isUnread = item.odczytano === false;
  const isNewResponse = isAdmin && item.nowaOdpowiedz === true;
  
  const navigateToDetails = () => {
    const params = { uid: item.userId, id: item.id };
    navigation.navigate('details', params);
  };

  return (
    <Pressable onPress={navigateToDetails}>
      <View style={[styles.notificationItem, isUnread && styles.unreadNotification, isNewResponse && styles.newResponseNotification]}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.tytul}</Text>
          {isAdmin && item.userData && item.userData.email ? (
            <Text>{item.userData.email}</Text>
          ) : null}
        </View>
        <Text style={styles.notificationDate}>Otrzymano: {notificationDate}</Text>
      </View>
    </Pressable>
  );
  
};


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
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
          <FlatList
            data={notifications.sort()}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => index.toString()}
          />        
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
    paddingHorizontal: '15%',
  },
  containerOS: {
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
