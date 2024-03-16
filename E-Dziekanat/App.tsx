import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Platform } from 'react-native';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import Notif_Mobile from './components/Notif_Mobile';
import TokenGetter from './components/TokenWeb';

//screens
import Login from './screens/Login';

export default function App() {

  /*return (
    <View style={styles.container}>
      {Platform.OS =="web"?<TokenGetter/>:<Notif_Mobile/>}
      <StatusBar style="auto" />
    </View>
  );*/
  
  return (
    <View style={styles.container}>
      <Login />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
