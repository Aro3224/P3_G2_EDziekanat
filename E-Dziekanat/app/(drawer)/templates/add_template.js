import React, { useState } from 'react';
import { Text, View, StyleSheet, Button,SafeAreaView, TextInput, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, push } from "firebase/database";



export default function AddTemplatePage() {
  const [templateTitle, onChangeTitle] = useState('');
  const [templateContent, onChangeContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  const validateTitle = (title) => {
    return title.length > 0;
  };

  const validateContent = (content) => {
    return content.length > 0;
  };

  const addTemplate = () => {
    setTitleError('');
    setContentError('');

    if (!validateTitle(templateTitle)) {
      setTitleError('Tytuł nie może być pusty.');
      return;
    }

    if (!validateContent(templateContent)) {
      setContentError('Treść powiadomienia nie może być pusta.');
      return;
    }


      
    const templateRef = ref(db, '/templates'); // Referencja do ścieżki '/templates' w bazie danych
    const newTemplateRef = push(templateRef); // Nowy unikalny klucz dla szablonu
  
    set(newTemplateRef, { // Ustawia dane szablonu pod nowym unikalnym kluczem
      title: templateTitle,
      content: templateContent,
      inUse: false,
    })
      .then(() => {
        console.log('Szablon został dodany');
      onChangeTitle("");
      onChangeContent("");
      Alert.alert("Dodano szablon","Szablon został dodany do systemu")
      })

      

  }

  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Dodaj szablon", 
        headerShown: true, 
        }}/>
      <SafeAreaView>
        <Text>Podaj tytuł:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={onChangeTitle}
          value={templateTitle}
          placeholder='Tytuł'
        />
        <Text style={styles.errorText}>{titleError}</Text>
        <Text>Wpisz treść powiadomienia:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={onChangeContent}
          value={templateContent}
          placeholder="Treść powiadomienia"
        />
        <Text style={styles.errorText}>{contentError}</Text>
      </SafeAreaView>
      <Button title='Dodaj' onPress={addTemplate}/>
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
