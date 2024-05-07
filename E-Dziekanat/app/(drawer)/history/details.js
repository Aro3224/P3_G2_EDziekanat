import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, child, set, push, serverTimestamp, onValue } from "firebase/database";
import { useRoute } from '@react-navigation/native';
import { auth } from '../../../components/configs/firebase-config';

export default function NextPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationContent, setNotificationContent] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState([]);
  const route = useRoute();
  const notificationId = route.params.id;
  const userId = route.params.uid;
  const currentUserUid = auth.currentUser.uid;

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const roleRef = ref(db, `users/${currentUserUid}/Rola`);
        const roleSnapshot = await get(roleRef);
        setIsAdmin(roleSnapshot.exists() && roleSnapshot.val() === 'Pracownik');
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const dbRef = isAdmin
      ? ref(db, `notifications/${userId}/${notificationId}`)
      : ref(db, `notifications/${currentUserUid}/${notificationId}`);

    const fetchNotificationContent = async () => {
      try {
        const contentSnapshot = await get(child(dbRef, 'tresc'));
        if (contentSnapshot.exists()) {
          setNotificationContent(contentSnapshot.val());
        } else {
          console.log("No data found for this notification id");
        }
      } catch (error) {
        console.error('Error fetching notification content:', error);
      }
    };

    const fetchNotificationTitle = async () => {
      try {
        const titleSnapshot = await get(child(dbRef, 'tytul'));
        if (titleSnapshot.exists()) {
          setNotificationTitle(titleSnapshot.val());
        } else {
          console.log("No data found for this notification id");
        }
      } catch (error) {
        console.error('Error fetching notification title:', error);
      }
    };

    const updateReadStatus = async () => {
      try {
        await set(child(dbRef, 'odczytano'), true);
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    };

    const fetchResponses = () => {
      const responsesRef = isAdmin
        ? ref(db, `notifications/${userId}/${notificationId}/odpowiedzi`)
        : ref(db, `notifications/${currentUserUid}/${notificationId}/odpowiedzi`);
    
      onValue(responsesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const responsesArray = Object.values(data);
          setResponses(responsesArray);
        } else {
          setResponses([]);
        }
      });
      console.log("isAdmin:", isAdmin);
      console.log("responsesRef:", responsesRef);

    };
    

    fetchNotificationContent();
    fetchNotificationTitle();
    updateReadStatus();
    fetchResponses();

  }, [notificationId, isAdmin]);

  const handleSendResponse = async () => {
    try {
      const dbRef = isAdmin
        ? ref(db, `notifications/${userId}/${notificationId}/odpowiedzi`)
        : ref(db, `notifications/${currentUserUid}/${notificationId}/odpowiedzi`);

      const responseObj = {
        tresc: response,
        data: serverTimestamp(),
        isAdmin : isAdmin
      };
      await push(dbRef, responseObj);
      setResponse('');
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const renderResponseItem = ({ item }) => {
    const isCurrentUser = userId === currentUserUid;
    const isAdminResponse = item.isAdmin;
  
    return (
      <View style={[
        styles.responseItem,
        !isAdminResponse ? styles.responseItemUser : styles.responseItemAdmin
      ]}>
        <Text>{item.tresc}</Text>
        <Text>Data przesłania: {new Date(item.data).toLocaleString()}</Text>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
    <Drawer.Screen
        options={{
          title: notificationTitle,
          headerShown: true,
        }}
      />
      <Text style={styles.title}>{notificationTitle}</Text>
      <Text style={styles.content}>{notificationContent}</Text>
      <FlatList
        data={responses}
        renderItem={renderResponseItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={styles.input}
        onChangeText={setResponse}
        value={response}
        placeholder="Wpisz odpowiedź"
        multiline={true}
        numberOfLines={4}
      />
      <Button title="Wyślij" onPress={handleSendResponse} />
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
  content: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  responseItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  responseItemUser: {
    alignSelf: 'flex-end',
    borderColor: '#007bff',
  },
  responseItemAdmin: {
    alignSelf: 'flex-start',
    borderColor: '#28a745',
  },
});
