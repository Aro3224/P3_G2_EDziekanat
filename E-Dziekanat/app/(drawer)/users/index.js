import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, FlatList, TouchableOpacity, Alert  } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import 'firebase/auth';
import 'firebase/database';
import firebase from 'firebase/app';


export default function UsersPage() {
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = database().ref('/users');
    const fetchUsers = () => {
      usersRef.once('value', snapshot => {
        const usersData = snapshot.val();
        if (usersData) {
          const usersArray = Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key]
          }));
          setUsers(usersArray);
        }
      });
    };
    
    fetchUsers();

    // Subskrybujemy na zdarzenia zmiany w bazie danych, aby odświeżyć listę
    const usersListener = usersRef.on('value', fetchUsers);

    // Zatrzymujemy nasłuchiwanie przy odmontowywaniu komponentu
    return () => usersListener();
  }, []);

  const handleDeleteUser = (userId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć tego użytkownika?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              // Usuwanie użytkownika z Firebase Authentication
              await auth().currentUser.delete();

              // Usuwanie użytkownika z bazy danych Firebase Realtime
              await database().ref(`/users/${userId}`).remove();

              console.log('Użytkownik został usunięty z Firebase Authentication i bazy danych.');
            } catch (error) {
              console.error('Błąd podczas usuwania użytkownika:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania użytkownika. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


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
          <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
              <Text style={styles.deleteButton}>Usuń</Text>
            </TouchableOpacity>
            <Link href={`/(drawer)/users/edit_user?id=${item.id}`}>
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
  deleteButton: {
    color: 'red',
  },
  editButton: {
    color: 'blue',
  },
})