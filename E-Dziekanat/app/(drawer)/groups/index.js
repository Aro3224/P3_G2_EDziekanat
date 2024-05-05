import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { ref, onValue, remove, get } from "firebase/database";
import { StyledButton, ButtonText, PageTitle } from '../../../components/styles';

export default function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

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
            return `${userData?.Imie} ${userData?.Nazwisko}`;
          }));
          return {
            id: key,
            users: usersDetails
          };
        }));
        setGroups(groupsArray);
      }
    });
    fetchUserRole();
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

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      const path = 'users/' + user.uid;
      const snapshot = await get(ref(db, path));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData?.Rola == "Wykładowca") {
          setRedirect(true);
        } else {
          setRedirect(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (redirect) {
    const link = document.createElement('a');
    link.href = "/(drawer)/home";
    link.click();
  }

  const selectGroup = (groupId) => {
    setSelectedGroup(groupId);
    console.log(groupId)
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Drawer.Screen
          options={{
            title: "Grupy",
            headerShown: true,
            headerLeft: () => <DrawerToggleButton />
          }} />
        <PageTitle>Lista Grup</PageTitle>
        <Link href="/(drawer)/groups/creategroup" asChild style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Utwórz grupę</Text>
          </Pressable>
        </Link>
        <View style={styles.upperPanel}>
          <Text style={styles.sectionTitle}>Wybierz grupę:</Text>
          {groups.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.groupItem,
                selectedGroup === item.id && styles.selectedGroupItem
              ]}
              onPress={() => selectGroup(item.id)}
            >
              {Platform.OS !== 'web' ? (
                <Text style={[styles.groupEmail, selectedGroup === item.id && styles.selectedText]}>{item.id}</Text>
              ) : (
                <>
                  <Text style={[styles.groupMembers, selectedGroup === item.id && styles.selectedText]}>{item.users.length > 0 ? item.users.join(', ') : 'Brak członków'}</Text>
                  <Text style={[styles.groupID, selectedGroup === item.id && styles.selectedText]}>{item.id}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          {selectedGroup && (
            <Link href={`/(drawer)/groups/edit_group?id=${selectedGroup}`} asChild style={styles.button}>
              <Pressable>
                <Text style={styles.buttonText}>Edytuj grupę</Text>
              </Pressable>
            </Link>
          )}
          {selectedGroup && (
            <StyledButton onPress={() => {Platform.OS == "web"?handleDeleteGroupWeb(selectedGroup):handleDeleteGroup(selectedGroup)}}>
              <ButtonText>Usuń</ButtonText>
            </StyledButton>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
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
    justifyContent: 'space-between',
  },
  upperPanel: {
    width: '80%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  groupItem: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedGroupItem: {
    backgroundColor: '#6D28D9',
  },
  groupID: {
    fontSize: 14,
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#6D28D9", 
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '83%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'flex-end'
  },
  buttonContainerOS: {
    marginTop: 15,
  },
  });
