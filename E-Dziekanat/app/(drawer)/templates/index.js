import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db } from '../../../components/configs/firebase-config';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getDatabase, onValue, ref, set, remove, update } from "firebase/database";

export default function TemplatesPage() {

  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const templatesRef = ref(db,'/templates');
      onValue(templatesRef, (snapshot) => {
        const templatesData = snapshot.val();
        if (templatesData) {
          const templatesArray = Object.keys(templatesData).map(key => ({
            id: key,
            ...templatesData[key]
          }));
          setTemplates(templatesArray);
        }
      });
  }, []);


  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć ten szablon?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              await remove(ref(db, `/templates/${templateId}`));
              console.log('Szablon został usunięty z bazy danych.');
            } catch (error) {
              console.error('Błąd podczas usuwania szablonu:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteTemplateWeb = (templateId) => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć ten szablon?');
    
    if (confirmation) {
      try {
        remove(ref(db, `/templates/${templateId}`))
          .then(() => {
            console.log('Szablon został usunięty z bazy danych.');
          })
          .catch((error) => {
            console.error('Błąd podczas usuwania szablonu:', error);
            alert('Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
          });
      } catch (error) {
        console.error('Błąd podczas usuwania szablonu:', error);
        alert('Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
      }
    }
  };
  
  const handleSetTemplateInUse = (templateId) => {
    const updatedTemplates = templates.map(template => ({
      ...template,
      inUse: template.id === templateId
    }));

    const updates = {};
    updatedTemplates.forEach(template => {
      updates[`/templates/${template.id}/inUse`] = template.inUse;
    });

    try {
      update(ref(db), updates);
      setTemplates(updatedTemplates); // Aktualizacja stanu templates
      console.log('Szablon został ustawiony jako używany.');
    } catch (error) {
      console.error('Błąd podczas ustawiania szablonu jako używanego:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas ustawiania szablonu jako używanego. Spróbuj ponownie później.');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Drawer.Screen 
          options={{ 
            title:"Szablony", 
            headerShown: true, 
            headerLeft: ()=> <DrawerToggleButton/>}} />
        <Text>Szablony</Text>
        <Link href="/(drawer)/templates/add_template" asChild style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Dodaj szablon</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Lista Szablonów</Text>
        <FlatList
          data={templates}
          renderItem={({ item }) => (
            <View style={styles.templeteItem}>
              <Text>ID: {item.id}</Text>
              <Text>Tytuł: {item.title}</Text>
              <Text>Treść: {item.content}</Text>
              <Text>Aktualnie używany: {item.inUse===false?"nie":"tak"}</Text>
              <TouchableOpacity onPress={() => handleSetTemplateInUse(item.id)}>
                <Text style={styles.useButton}>Ustaw jako używany</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {Platform.OS == "web"?handleDeleteTemplateWeb(item.id):handleDeleteTemplate(item.id)}}>
                <Text style={styles.deleteButton}>Usuń</Text>
              </TouchableOpacity>
              <Link href={`/(drawer)/templates/edit_template?id=${item.id}`}>
                <Text style={styles.editButton}>Edytuj</Text>
              </Link>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </>
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
  userItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  useButton: {
    color: 'green',
    marginBottom: 5,
  },
  deleteButton: {
    color: 'red',
  },
  editButton: {
    color: 'blue',
  },
});
