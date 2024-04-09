import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable,TouchableOpacity, Platform, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db } from '../../../components/configs/firebase-config';
import { onValue, ref, set, remove, get } from "firebase/database";

export default function ButtonsPage() {

  const [buttons, setButtons] = useState([]);
  const [newButtonData, setNewButtonData] = useState({userID: ''});

  useEffect(() => {
    const buttonsRef = ref(db, '/buttons');
    onValue(buttonsRef, (snapshot) => {
      const buttonsData = snapshot.val();
      if (buttonsData) {
        const buttonsArray = Object.keys(buttonsData).map(async key => {
          const button = buttonsData[key];
          if (button.type === 'user') {
            const userEmailRef = ref(db, `/users/${button.userID}/email`);
            const userEmailSnapshot = await get(userEmailRef);
            const userEmail = userEmailSnapshot.val();
            console.log("UserID:", button.userID, "Email:", userEmail);
            return {
              id: key,
              email: userEmail,
              ...button
            };
          } else {
            return {
              id: key,
              email: button.userID,
              ...button
            };
          }
        });
        Promise.all(buttonsArray).then(resolvedButtons => {
          setButtons(resolvedButtons.filter(button => button !== null));
        });
      }
    });
  }, []);
  
  



  const handleDeleteTemplate = () => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć ostatni przycisk?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              const maxId = Math.max(...buttons.map(button => parseInt(button.id)));
              await remove(ref(db, `/buttons/${maxId}`));
              const updatedButtons = buttons.filter(button => parseInt(button.id) !== maxId);
              setButtons(updatedButtons);
              console.log(`Przycisk o największym ID (${maxId}) został usunięty z bazy danych.`);
            } catch (error) {
              console.error('Błąd podczas usuwania przycisku:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania przycisku o największym ID. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  const handleDeleteTemplateWeb = async () => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć ostatni przycisk?');
    
    if (confirmation) {
      try {
        const maxId = Math.max(...buttons.map(button => parseInt(button.id)));
        await remove(ref(db, `/buttons/${maxId}`));
        const updatedButtons = buttons.filter(button => parseInt(button.id) !== maxId);
        setButtons(updatedButtons);
        console.log(`Przycisk o największym ID (${maxId}) został usunięty z bazy danych.`);
      } catch (error) {
        console.error('Błąd podczas usuwania przycisku:', error);
        Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania przycisku o największym ID. Spróbuj ponownie później.');
      }
    };
  }
  const addButton = async () => {
    try {
      const maxId = Math.max(...buttons.map(button => button.id));
      const newButtonId = maxId + 1;

      const newButtonRef = ref(db, `/buttons/${newButtonId}`);
      await set(newButtonRef, newButtonData);

      console.log('Przycisk został dodany do bazy danych.');
    } catch (error) {
      console.error('Błąd podczas dodawania przycisku:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania przycisku. Spróbuj ponownie później.');
    }
  };


  

  
  return (
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title:"Przyciski", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text style={styles.title}>Przyciski</Text>
        <Pressable style={styles.button} onPress={addButton}>
          <Text style={styles.buttonText}>Dodaj przycisk</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={Platform.OS == "web"?handleDeleteTemplateWeb:handleDeleteTemplate}>
          <Text style={styles.buttonText}>Usuń przycisk</Text>
        </Pressable>
      <View style={styles.templatesContainer}>
        {buttons.map(button => (
          <View
            key={button.id}
            style={styles.templateItem}
          >
            <Text style={styles.templateTitle}>Przycisk {button.id}</Text>
            <Text style={styles.templateTitle}>Wykładowca: {button.email === '' ? 'Nie przypisano' : button.email}
            </Text>
            <Link href={`/(drawer)/buttons/edit_button?id=${button.id}`}>
              <Text style={styles.editButton}>Edytuj</Text>
            </Link>
          </View>
        ))}
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
    padding: 20,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  templatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  templateItem: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '45%',
  },
  selectedTemplateItem: {
    backgroundColor: '#aaf',
  },
  templateTitle: {
    fontWeight: 'bold',
  },
  templateContent: {
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: "red", 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  editButton: {
    color: 'blue',
  },
});