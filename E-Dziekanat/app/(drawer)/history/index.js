import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Button } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { getDatabase, ref, child, get } from "firebase/database";
import { Link } from 'expo-router';

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

    return (
      <View style={[styles.notificationItem, isUnread && styles.unreadNotification, isNewResponse && styles.newResponseNotification]}>
        {isAdmin && item.userData && item.userData.email ? (
          <Text>{item.userData.email}</Text>
        ) : null}
        <Text style={styles.notificationTitle}>{item.tytul}</Text>
        <Text style={styles.notificationText}>{item.tresc}</Text>
        <Text style={styles.notificationDate}>Data: {notificationDate}</Text>
        <View style={styles.buttonContainer}>
          <Link
            href={`/(drawer)/history/details?uid=${item.userId}&id=${item.id}`}
          >
            <Text style={styles.openButton}>Otwórz</Text>
          </Link>
          {isNewResponse && <Text style={styles.newResponseText}>Nowa odpowiedź</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title: isAdmin ? "Wszystkie powiadomienia" : "Historia powiadomień", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      
      <Text style={styles.title}>Lista powiadomień:</Text>
      <View style={styles.filters}>
        <Button
          title={sortDescending ? 'Od najstarszych' : 'Od najnowszych'}
          onPress={toggleSortOrder}
        />
        <Button
          title="Odśwież"
          onPress={refreshNotifications}
        />
      </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: "#eee",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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
    alignItems: 'center',
  },
});
