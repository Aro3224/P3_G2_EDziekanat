import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, ScrollView, FlatList, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, child, set, push, serverTimestamp, onValue } from "firebase/database";
import { useRoute } from '@react-navigation/native';
import { auth } from '../../../components/configs/firebase-config';
import { PageTitle, StyledButton, ButtonText } from '../../../components/styles';

export default function NextPage() {
  const [notificationContent, setNotificationContent] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState([]);
  const route = useRoute();
  const notificationId = route.params.id;

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

    const updateReadStatus = async () => {
      try {
        const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}`);
        await set(child(dbRef, 'odczytano'), true);
      } catch (error) {
        console.error('Błąd podczas aktualizacji statusu odczytania powiadomienia:', error);
      }
    };


    const fetchResponses = () => {
      const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}/odpowiedzi`);
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const responsesArray = Object.values(data);
          setResponses(responsesArray);
        } else {
          setResponses([]);
        }
      });
    };

    const fetchDate = async () => {
      try {
        const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}`);
        const snapshot = await get(child(dbRef, 'czas'));
        if (snapshot.exists()) {
          const czasOtrzymania = new Date(snapshot.val()).toLocaleString();
          setNotificationDate(czasOtrzymania);
        } else {
          console.log("Brak danych dla tego id wiadomości");
        }
      } catch (error) {
        console.error('Błąd podczas pobierania daty wysłania powiadomienia:', error);
      }
    };

    fetchNotificationContent();
    fetchNotificationTitle();
    updateReadStatus();
    fetchResponses();
    fetchDate();
  }, [notificationId]);

  const handleSendResponse = async () => {
    try {
      const dbRef = ref(db, `notifications/${auth.currentUser.uid}/${notificationId}/odpowiedzi`);
      const responseObj = {
        tresc: response,
        data: serverTimestamp()
      };
      await push(dbRef, responseObj);
      setResponse('');
    } catch (error) {
      console.error('Błąd podczas zapisywania odpowiedzi:', error);
    }
  };

  const renderResponseItem = ({ item }) => (
    <View style={styles.responseItem}>
      <Text>{item.tresc}</Text>
      <Text>Data przesłania: {new Date(item.data).toLocaleString()}</Text>
    </View>
  );


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
       <Drawer.Screen
        options={{
          title: notificationTitle,
          headerShown: true,
        }}
      />
      <PageTitle style={{marginBottom: 10}}>{notificationTitle}</PageTitle>
      <View style={styles.messageContainer}>
      <Text style={styles.content}>{notificationContent}</Text>
      <FlatList
        data={responses}
        renderItem={renderResponseItem}
        keyExtractor={(item, index) => index.toString()}
        
      />
      <Text style={{marginBottom: 30}}>Otrzymano: {notificationDate}</Text>
      </View>
      <TextInput
        style={styles.input}
        onChangeText={setResponse}
        value={response}
        placeholder="Wpisz odpowiedź"
        multiline={true}
        numberOfLines={4}
      />
      <StyledButton onPress={handleSendResponse}>
        <ButtonText>Wyślij</ButtonText>
      </StyledButton>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingHorizontal: '20%',
  },
  containerOS: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
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
    borderColor: '#ccc',
    borderRadius: 5,
  },
  messageContainer: {
    backgroundColor: '#e8e8e8',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    padding: 30,
    flex: 1,
  },
});
