import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, FlatList, TouchableOpacity, Platform, Alert, } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getDatabase, onValue, ref, set, remove } from "firebase/database";
import axios from 'axios';


export default function UsersPage() {
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(db,'/users');
      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
          const usersArray = Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key]
          }));
          setUsers(usersArray);
        }
      });
  

  }, []);


  const deleteUserMobile = (userId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć tego użytkownika?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              const response = await axios.post('http://localhost:8000/api/delete-user/', {
                UID: userId,
              });
              console.log(response.data);
            } catch (error) {
              console.error('Błąd podczas wysyłania żądania usunięcia użytkownika:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania użytkownika. Spróbuj ponownie później.');
            }
              
            
          },
        },
      ],
      { cancelable: false }
    );
  };

 


  const deleteUserWeb = async (userId) => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć tego użytkownika?');
    if (confirmation) {
    try {
      const response = await axios.post('http://localhost:8000/api/delete-user/', {
        UID: userId,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Błąd podczas wysyłania żądania usunięcia użytkownika:', error);
    }
  };
}

  

  return (
    <>
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Użytkownicy", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
        <Link href="/(drawer)/users/add_user" asChild style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Dodaj użytkownika</Text>
          </Pressable>
        </Link>
    </View>
    <View style={styles.container}>
    <Text style={styles.title}>Lista Użytkowników</Text>
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <View style={styles.userItem}>
          <Text>ID: {item.id}</Text>
          <Text>Email: {item.email}</Text>
          <TouchableOpacity onPress={() => {Platform.OS == "web"?deleteUserWeb(item.id):deleteUserMobile(item.id)}}>
              <Text style={styles.deleteButton}>Usuń</Text>
            </TouchableOpacity>
            <Link href={`/(drawer)/users/edit_user?id=${item.id}`}>
              <Text style={styles.editButton}>Edytuj</Text>
            </Link>
            <TouchableOpacity onPress={() => sendDataToBackend(item.id)}>
              <Text style={styles.deleteButton}>Wyślij</Text> 
            </TouchableOpacity>
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
  deleteButton: {
    color: 'red',
  },
  editButton: {
    color: 'blue',
  },
})