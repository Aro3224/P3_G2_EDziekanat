import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db } from '../../../components/configs/firebase-config';
import { ref, onValue, remove, get } from "firebase/database";

export default function GroupPage() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const groupsRef = ref(db, '/groups');
    onValue(groupsRef, async (snapshot) => {
      const groupsData = snapshot.val();
      if (groupsData) {
        const groupsArray = await Promise.all(Object.keys(groupsData).map(async key => {
          const users = groupsData[key].Users || [];
          const usersDetails = await Promise.all(users.map(async userID => {
            const userSnapshot = await get(ref(db, `users/${userID}`));
            const userData = userSnapshot.val();
            return `${userData.Imie} ${userData.Nazwisko}`;
          }));
          return {
            id: key,
            users: usersDetails
          };
        }));
        setGroups(groupsArray);
      }
    });

  }, []);

  const handleDeleteGroup = (groupId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć tę grupę?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              await remove(ref(db, `/groups/${groupId}`));
              console.log('Grupa została usunięta z bazy danych.');
              setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
            } catch (error) {
              console.error('Błąd podczas usuwania grupy:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania grupy. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteGroupWeb = (groupId) => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć tę grupę?');
    
    if (confirmation) {
      try {
        remove(ref(db, `/groups/${groupId}`))
          .then(() => {
            console.log('Grupa została usunięty z bazy danych.');
            setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
          })
          .catch((error) => {
            console.error('Błąd podczas usuwania grupy:', error);
            alert('Wystąpił błąd podczas usuwania grupy. Spróbuj ponownie później.');
          });
      } catch (error) {
        console.error('Błąd podczas usuwania grupy:', error);
        alert('Wystąpił błąd podczas usuwania grupy. Spróbuj ponownie później.');
      }
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Drawer.Screen 
          options={{ 
            title: "Grupy", 
            headerShown: true, 
            headerLeft: () => <DrawerToggleButton/>
          }} />
        <Text style={styles.subtitle}>Grupy</Text>
        <Link href="/(drawer)/groups/creategroup" asChild style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Utwórz grupę</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Lista Grup</Text>
        <FlatList
          data={groups}
          renderItem={({ item }) => (
            <View style={styles.groupItem}>
              <Text>Nazwa: {item.id}</Text>
              <Text>Członkowie: {item.users.length > 0 ? item.users.join(', ') : 'Brak członków'}</Text>
              <TouchableOpacity onPress={() => {Platform.OS == "web"?handleDeleteGroupWeb(item.id):handleDeleteGroup(item.id)}}>
                <Text style={styles.deleteButton}>Usuń</Text>
              </TouchableOpacity>
              <Link href={`/(drawer)/groups/edit_group?id=${item.id}`}>
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
  subtitle: {
    fontSize: 36,
    marginBottom: 10,
    fontWeight: 'bold',
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
  groupItem: {
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
});
