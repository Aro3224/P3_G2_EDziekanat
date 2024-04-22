import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, child } from "firebase/database";
import { useRoute } from '@react-navigation/native';
import { auth } from '../../../components/configs/firebase-config';

export default function NextPage() {
  const [notificationContent, setNotificationContent] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const route = useRoute();
  const notificationId = route.params.id; // Przechwyć przekazane id wiadomości

  useEffect(() => {
    const fetchNotificationContent = async () => {
      try {
        const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}`);
        const snapshot = await get(child(dbRef, 'tresc'));
        if (snapshot.exists()) {
          setNotificationContent(snapshot.val());
        } else {
          console.log("Brak danych dla tego id wiadomości");
        }
      } catch (error) {
        console.error('Błąd podczas pobierania treści powiadomienia:', error);
      }
    };

    const fetchNotificationTitle = async () => {
      try {
        const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}`);
        const snapshot = await get(child(dbRef, 'tytul'));
        if (snapshot.exists()) {
          setNotificationTitle(snapshot.val());
        } else {
          console.log("Brak danych dla tego id wiadomości");
        }
      } catch (error) {
        console.error('Błąd podczas pobierania tytułu powiadomienia:', error);
      }
    };

    fetchNotificationContent();
    fetchNotificationTitle();
  }, [notificationId]);

  return (
    <View style={styles.container}>
      <Drawer.Screen
        options={{
          title: notificationTitle, // Ustaw tytuł strony na tytuł wiadomości
          headerShown: true,
        }}
      />
      <Text>{notificationContent}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
});
