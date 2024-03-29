import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { auth } from '../../../components/configs/firebase-config';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState(null);

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
  }, []);

  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Strona główna", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text>{`Witaj ${userEmail || ''}`}</Text>
      <Text>Tutaj pojawią się nieprzeczytane powiadomienia</Text>
      <Link href={"/(drawer)/home/nextpage"}>
        <Text>Przejdź do podstrony</Text>
      </Link>
    </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
})
