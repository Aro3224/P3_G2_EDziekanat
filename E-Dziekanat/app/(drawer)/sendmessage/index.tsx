import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, update } from "firebase/database";
import { db } from '../../../components/configs/firebase-config';

export default function SendMessagePage() {
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageTitle, setMessageTitle] = useState('');

  const sendMessage = () => {
    // Implement sending message logic here
    console.log('Message sent:', message);
    console.log('To:', selectedUser);
    console.log('Template:', selectedTemplate);
    console.log('Title:', messageTitle);
    
    // Clear inputs after sending
    setMessage('');
    setSelectedUser('');
    setSelectedTemplate('');
    setMessageTitle('');
  }

  return (
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title:"Wyślij wiadomość", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text style={styles.subtitle}>Wyślij wiadomość</Text>

      <View style={styles.upperPanelContainer}>
        {/* Panel wyboru użytkownika */}
        <View style={styles.upperPanel}>
          <TextInput
            style={styles.input}
            placeholder="Wybierz użytkownika"
            value={selectedUser}
            onChangeText={setSelectedUser}
          />
        </View>
        {/* Panel wyboru szablonu wiadomości */}
        <View style={styles.upperPanel}>
          <TextInput
            style={styles.input}
            placeholder="Wybierz szablon wiadomości"
            value={selectedTemplate}
            onChangeText={setSelectedTemplate}
          />
        </View>
        {/* Panel wprowadzania tytułu wiadomości */}
        <View style={styles.upperPanel}>
          <TextInput
            style={styles.input}
            placeholder="Wprowadź tytuł wiadomości"
            value={messageTitle}
            onChangeText={setMessageTitle}
          />
        </View>
      </View>

      {/* Panel dolny (do wpisywania treści wiadomości) */}
      <View style={styles.lowerPanel}>
        <TextInput
          style={styles.messageInput}
          placeholder="Wpisz treść wiadomości..."
          multiline
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
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
  upperPanelContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  upperPanel: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  lowerPanel: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  messageInput: {
    width: '100%',
    height: 120,
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
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff", 
    fontSize: 16,
    fontWeight: "bold",
  },
});
