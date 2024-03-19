import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, update } from "firebase/database";
import { db } from '../../../components/configs/firebase-config'


export default function FillDataPage() {

  const [textNameValue, setTextNameValue] = useState<string>('');
  const [textSurnameValue, setTextSurnameValue] = useState<string>('');
  const [textPhoneValue, setTextPhoneValue] = useState<string>('');
  
    const SaveData= () => {
        // Saving text in the database
        update(ref(db, 'Users/User1'), {
          Imie: textNameValue
        }).then(() => {
          // Data saved successfully!
          console.log('Name updated')
        })
          .catch((error) => {
            // Write failed...
            alert(error);
          });
    
        // Clearing the text input after sending.
        setTextNameValue('');

        update(ref(db, 'Users/User1'), {
            Nazwisko: textSurnameValue
          }).then(() => {
            // Data saved successfully!
            console.log('Surname updated')
          })
            .catch((error) => {
              // Write failed...
              alert(error);
            });
      
          // Clearing the text input after sending.
          setTextSurnameValue('');

          update(ref(db, 'Users/User1'), {
            NrTelefonu: textPhoneValue
          }).then(() => {
            // Data saved successfully!
            console.log('Phone number updated')
          })
            .catch((error) => {
              // Write failed...
              alert(error);
            });
      
          // Clearing the text input after sending.
          setTextPhoneValue('');
      };

      return (
        <View style={styles.container}>
        <Drawer.Screen 
          options={{ 
          title:"Uzupełnij Dane", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
        <Text style={styles.subtitle}>Uzupełnij swoje dane</Text>
          <TextInput
            style={styles.input}
            placeholder="Wpisz imię..."
            value={textNameValue}
            onChangeText={setTextNameValue}
          />
          <TextInput
            style={styles.input}
            placeholder="Wpisz naziwsko..."
            value={textSurnameValue}
            onChangeText={setTextSurnameValue}
          />
          <TextInput
            style={styles.input}
            placeholder="Wpisz numer telefonu..."
            value={textPhoneValue}
            onChangeText={setTextPhoneValue}
          />
          <TouchableOpacity style={styles.button} onPress={SaveData}>
            <Text style={styles.buttonText}>Zapisz</Text>
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 36,
    marginBottom: 10,
    fontWeight: 'bold',
},
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
},
input: {
  width: '40%',
  height: 40,
  borderWidth: 1,
  borderColor: '#ccc',
  paddingHorizontal: 10,
  marginBottom: 20,
},
button: {
  backgroundColor: "#007bff", 
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
  marginVertical: 10,
},
buttonText: {
  color: "#fff", 
  fontSize: 16,
  fontWeight: "bold",
},
})