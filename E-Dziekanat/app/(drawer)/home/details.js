import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, Pressable, FlatList, ScrollView, Platform} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, child, set, push, serverTimestamp, onValue, update } from "firebase/database";
import { useRoute } from '@react-navigation/native';
import { auth } from '../../../components/configs/firebase-config';
import { PageTitle, StyledButton, ButtonText } from '../../../components/styles';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NextPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationContent, setNotificationContent] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState([]);
  const route = useRoute();
  const notificationId = route.params.id;
  const userId = route.params.uid;
  const currentUserUid = auth.currentUser.uid;
  const navigation = useNavigation();

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
        const contentSnapshot = await get(child(dbRef, 'tresc'));
        const titleSnapshot = await get(child(dbRef, 'tytul'));
    
        if (contentSnapshot.exists() && titleSnapshot.exists()) {
          const currentTime = serverTimestamp();
    
          if (!isAdmin) {
            await update(dbRef, {
              odczytano: true,
              czasOdczytania: currentTime
            });
            console.log("Odczytano set to True and czasOdczytania updated");
          } else {
            await update(dbRef, {
              nowaOdpowiedz: false,
              czasOdczytania: currentTime
            });
            console.log("nowaOdpowiedz set to False and czasOdczytania updated");
          }
          console.log("Notification status changed");
        } else {
          console.log("Error fetching notification title or content");
        }
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

  }, [notificationId, isAdmin]);

  const handleSendResponse = async () => {
    try {
      const dbRef = isAdmin
        ? ref(db, `notifications/${userId}/${notificationId}/odpowiedzi`)
        : ref(db, `notifications/${currentUserUid}/${notificationId}/odpowiedzi`);
  
      const responseObj = {
        tresc: response,
        data: serverTimestamp(),
        isAdmin: isAdmin
      };
  
      await push(dbRef, responseObj);
      setResponse('');
  
      if (!isAdmin) {
        await update(ref(db, `notifications/${currentUserUid}/${notificationId}`), {
          nowaOdpowiedz: true
        });
      }
      if (isAdmin) {
        await update(ref(db, `notifications/${userId}/${notificationId}`), {
          odczytano: false
        });
      }
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

  const navigationBack = async () => {
    return navigation.goBack();
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
    <Drawer.Screen
        options={{
          title: notificationTitle,
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => navigationBack()}>
              <MaterialIcons name="arrow-back" size={24} color="black" style={{margin: 16}}/>
            </Pressable>
          ),
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
      <Text style={{marginBottom: 20}}>Otrzymano: {notificationDate}</Text>
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
  messageContainer: {
    backgroundColor: '#e8e8e8',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    padding: 30,
    flex: 1,
  },
});
