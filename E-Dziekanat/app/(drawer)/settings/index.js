import React, { useState } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Redirect } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';

const auth = getAuth();

export default function SettingsPage({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogout = () => {
    // Wylogowanie użytkownika z Firebase
    signOut(auth)
      .then(() => {
        // Jeśli wylogowanie się powiodło, ustaw isAuthenticated na false
        setIsAuthenticated(false);
        console.log("Wylogowano użytkownika");
      })
      .catch((error) => {
        console.error("Błąd podczas wylogowywania użytkownika:", error);
      });
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
      <View style={styles.settingsContainer}>
        <Button
          onPress={handleLogout}
          title="Wyloguj"
          color="#841584"
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
  }
});
