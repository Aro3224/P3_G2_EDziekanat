import AsyncStorage from '@react-native-async-storage/async-storage'; 
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';

export async function requestUserPermission() { 
    const authStatus = await messaging().requestPermission();
    const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        console.log('Authorization status:', authStatus); 
        getFcmToken();
    }
}

const getFcmToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken'); 
    console.log('old Fcm Token:', fcmToken);
    if (fcmToken) {
        saveTokenToDatabase(fcmToken.toString());
    }
    if (!fcmToken) {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) { 
                console.log('new Generated Fcm Token:', fcmToken); 
                await AsyncStorage.setItem('fcmToken', fcmToken);
                saveTokenToDatabase(fcmToken.toString());
            }
        } catch (error) {
            console.log(error);
        }
    }
};

const saveTokenToDatabase = async (token: string) => {
    try {
        await database().ref('token').update({
            MobileToken: token,
        });
        console.log('FCM Token saved to database');
    } catch (error) {
        console.log('Error saving FCM Token to database:', error);
    }
};