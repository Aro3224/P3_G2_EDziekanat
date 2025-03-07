import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

export default function Notif_Mobile() {
  
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled;
  }

  useEffect(() => {
    const initializeMessaging = async () => {
      const permissionGranted = await requestUserPermission();
      if (permissionGranted) {
        //return fcm token for the device
        messaging().getToken().then(token => {
          console.log(token);
        });
      } else {
        console.log("Failed token status");
      }

      messaging()
        .getInitialNotification()
        .then(async (remoteMessage) => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage.notification,
            );
          }
        });

      messaging().onNotificationOpenedApp(async (remoteMessage) => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );
      });

      // Register background handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(JSON.stringify(remoteMessage.notification?.title), JSON.stringify(remoteMessage.notification?.body));
        console.log('Message handled in the app!', remoteMessage);
      });

      return unsubscribe;
    };

    initializeMessaging();

  }, []);

  return (
    <View style={styles.container}>
      <Text>Expo Notifications Mobile</Text>
      <StatusBar style="auto" />
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
