import React, { useState } from 'react';
import { render } from "react-dom";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ref, set, onValue, Database, DataSnapshot } from "firebase/database";
import { db } from './components/config';
import { getMessaging, getToken } from "firebase/messaging";
import {PermissionsAndroid} from 'react-native';
import { initializeApp } from "firebase/app";

interface AppProps { }

export default function App({ }: AppProps) {
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [receivedText, setReceivedText] = useState<string>('');

  const handleSendPress = () => {
    // Saving text in the database
    set(ref(db, 'wiadomosc/'), {
      testWiadomosc: textInputValue
    }).then(() => {
      // Data saved successfully!
      alert('data updated');
    })
      .catch((error) => {
        // Write failed...
        alert(error);
      });

    // Clearing the text input after sending.
    setTextInputValue('');
  };

  function readData() {
    const starCountRef = ref(db, 'token/');
    onValue(starCountRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      setReceivedText(data?.Token || '');
      alert("Token: " + receivedText);
    });

    /*
    try {
      // Wysłanie powiadomienia za pomocą Firebase Cloud Messaging
      messaging.Message({
        to: receivedText,
        notification: {
          title: "E-dziekanat",
          body: "Masz nowe powiadomienie!",
        },
        topic: 'wiadomosc', // Możesz użyć tematu, aby kierować powiadomienia do konkretnych urządzeń
        token: receivedText
      });
      // Informacja o poprawnym zapisie i wysłaniu powiadomienia
      alert('Wiadomość wysłana');
    } catch (error) {
      // Obsługa błędów
     alert('Wystąpił błąd: ' + error);
    }
    */
  }

  //WEB TOKEN AND NOTIFICATION PERMISSION
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve a registration token for use with FCM.
      // ...

      const messaging = getMessaging();
      getToken(messaging, { vapidKey: "BLuGoqDsX7yuknK9LLcX5UONfv3pPC3cVhw-6CfEYCqeksICoLZMfs3tNGVGck0i7k6EVkrIFtKUOmn77afoaYk" }).then((currentToken) => {
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          // ...
          set(ref(db, 'token/'), {
            Token: currentToken
          })
        } else {
          // Show permission request UI
          console.log('No registration token available. Request permission to generate one.');
          // ...
        }
      }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        // ...
      });


    } else {
      console.log('Unable to get permission to notify.');
    }
  });


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Wpisz tekst..."
        value={textInputValue}
        onChangeText={setTextInputValue}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendPress}>
        <Text style={styles.buttonText}>Wyślij</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={readData}>
        <Text style={styles.buttonText}>Odbierz</Text>
      </TouchableOpacity>
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
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

render(<App />, document.getElementById("root"));