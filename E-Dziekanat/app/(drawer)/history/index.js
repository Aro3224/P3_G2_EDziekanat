import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Button } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { getDatabase, ref, child, get } from "firebase/database";

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
    const fetchNotifications = async () => {
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
                const userNotificationsArray = Object.values(userNotifications);
                const notificationsWithUser = userNotificationsArray.map(notification => ({
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
            const fetchednotificationsData = snapshot.val();
            notificationsData = Object.values(fetchednotificationsData);
          }
        }

        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [isAdmin]);

  const renderNotificationItem = ({ item }) => {
    const notificationDate = new Date(item.czas).toLocaleString();

    return (
      <View style={styles.notificationItem}>
        {isAdmin && item.userData && item.userData.email ? (
        <Text>{item.userData.email}</Text>
      ) : null}
        <Text style={styles.notificationTitle}>{item.tytul}</Text>
        <Text style={styles.notificationText}>{item.tresc}</Text>
        <Text style={styles.notificationDate}>Data: {notificationDate}</Text>
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
});