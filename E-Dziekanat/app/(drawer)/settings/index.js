import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Redirect, Link } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, update } from "firebase/database";
import { Checkbox } from 'react-native-paper';

const auth = getAuth();

export default function SettingsPage({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userSurname, setUserSurname] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkedSMS, setCheckedSMS] = useState(false);

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
          setUserSurname(userData?.Nazwisko || '');
          setCheckedSMS(userData?.SendSMS || false); // Aktualizacja stanu checkboxa na podstawie wartości z bazy danych
        }
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsAuthenticated(false);
        console.log("Wylogowano użytkownika");
      })
      .catch((error) => {
        console.error("Błąd podczas wylogowywania użytkownika:", error);
      });
  };

  const handleSMSCheckbox = (sendsms) => {
    if (sendsms === 'true') {
        setCheckedSMS(prevState => !prevState);
        const path = 'users/'+ userId;
        update(ref(db, path), {
          SendSMS: !checkedSMS
        }).then(() => {
          console.log('SendSMS updated')
        })
          .catch((error) => {
            alert(error);
          });
    }
  };

  if (!isAuthenticated) {
    return <Redirect href="../../" />;
  }

  return (
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title: "Ustawienia", 
          headerShown: true, 
          headerLeft: () => <DrawerToggleButton/>
        }}
      />
      <Text style={styles.title}>{userName} {userSurname}</Text>
      <Text style={styles.subtitle}>{userEmail}</Text>
      <View style={styles.settingsContainer}>
      <View style={styles.checkboxContainer}>
                <Text>Powiadomienia SMS</Text>
                <Checkbox
                    status={checkedSMS ? 'checked' : 'unchecked'}
                    onPress={() => handleSMSCheckbox('true')}
                />
            </View>
        <Button
          onPress={handleLogout}
          title="Wyloguj"
          color="#CC0000"
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
  settingsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    color: 'blue',
    borderBlockColor: 'blue'
  },
});
