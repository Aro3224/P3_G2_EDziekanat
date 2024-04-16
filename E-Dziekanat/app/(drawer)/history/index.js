import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config'; // Importuj konfigurację Firebase
import { getDatabase, ref, child, get } from "firebase/database";

export default function HistoryPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = auth.currentUser.uid; // Pobierz ID obecnie zalogowanego użytkownika
        const dbRef = ref(db, `notifications/${userId}/`); // Odwołaj się do węzła z historią powiadomień
        const snapshot = await get(dbRef); // Pobierz dane z bazy danych

        console.log("Snapshot:", snapshot.val()); // Dodaj log do wyświetlenia danych z bazy danych

        if (snapshot.exists()) {
          const notificationsData = snapshot.val(); // Pobierz historię powiadomień
          // Konwertuj obiekt na tablicę
          const notificationsArray = Object.values(notificationsData);
          setNotifications(notificationsArray); // Ustaw historię powiadomień w stanie komponentu
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item }) => {
    const notificationDate = new Date(item.czas).toLocaleString();
  
    return (
      <View style={styles.notificationItem}>
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
          title:"Historia powiadomień", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text style={styles.title}>Lista powiadomień:</Text>
      <FlatList
        data={notifications}
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
});
