import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';


export default function NextPage() {

  const route = useRoute();
  const notificationContent = route.params.notificationContent;

  return (
    <View style={styles.container}>
      <Drawer.Screen
        options={{
          title: "Wiadomość",
          headerShown: true,
        }}
      />
      <Text>{notificationContent}</Text>
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