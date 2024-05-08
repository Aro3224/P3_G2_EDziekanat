import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Platform, ScrollView, Pressable } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { ref, get } from "firebase/database";
import { PageTitle, StyledButton, ButtonText } from '../../../components/styles';
import { useNavigation } from '@react-navigation/native';

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
            const userNotificationsArray = Object.entries(userNotifications);
            const notificationsWithUser = userNotificationsArray.map(([notificationId, notification]) => ({
              id: notificationId,
              ...notification,
              userId: uid,
              userData: users[uid]
            }));
            notificationsData = [...notificationsData, ...notificationsWithUser];
          }
        }
      }
    } else {
      const notificationsRef = ref(db, `notifications/${userId}/`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const fetchedNotificationsData = snapshot.val();
        const notificationsArray = Object.entries(fetchedNotificationsData);
        notificationsData = notificationsArray.map(([notificationId, notification]) => ({
          id: notificationId,
          ...notification
        }));
      }
    }

    return notificationsData;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export default function HistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [sortDescending, setSortDescending] = useState(true);
  const navigation = useNavigation();
  

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = auth.currentUser.uid;
        const roleRef = ref(db, `users/${userId}/Rola`);
        const roleSnapshot = await get(roleRef);

        if (roleSnapshot.exists() && roleSnapshot.val() === 'Pracownik') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationsData = await fetchNotifications(isAdmin);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [isAdmin]);

  const toggleSortOrder = () => {
    setSortDescending(!sortDescending);
  };

  const refreshNotifications = async () => {
    try {
      const notificationsData = await fetchNotifications(isAdmin);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const notificationDate = new Date(item.czas).toLocaleString();
    const isUnread = item.odczytano === false;
    const isNewResponse = isAdmin && item.nowaOdpowiedz === true;
    
    const navigateToDetails = () => {
      const params = { uid: item.userId, id: item.id }; // Update params with uid and id
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
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title: isAdmin ? "Wszystkie powiadomienia" : "Historia powiadomień", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      
      <PageTitle>Lista powiadomień:</PageTitle>
      <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
        <StyledButton onPress={toggleSortOrder}>
          <ButtonText>{sortDescending ? 'Od najstarszych' : 'Od najnowszych'}</ButtonText>
        </StyledButton>
        <StyledButton onPress={refreshNotifications}>
          <ButtonText>Odśwież</ButtonText>
        </StyledButton>
      </View>
      <View style={styles.upperPanel}>
      <Text style={styles.sectionTitle}>Powiadomienia:</Text>
      <FlatList
        data={notifications.sort((a, b) => {
          if (sortBy === 'newest') {
            return sortDescending ? b.czas - a.czas : a.czas - b.czas;
          } else {
            return sortDescending ? a.czas - b.czas : b.czas - a.czas;
          }
        })}
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  upperPanel: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 14,
    color: '#666',
  },
  notificationItem: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  unreadNotification: {
    backgroundColor: "#ffcccc",
  },
  newResponseText: {
    color: 'red',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '93%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'flex-end'
  },
  buttonContainerOS: {
    paddingHorizontal: 20,
    marginTop: 15,
    flexDirection: 'row',
  },
});
