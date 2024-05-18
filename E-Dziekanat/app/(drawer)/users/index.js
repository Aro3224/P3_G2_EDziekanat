import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth } from "firebase/auth";
import { onValue, ref, get } from "firebase/database";
import axios from 'axios';
import { StyledButton, ButtonText, PageTitle } from '../../../components/styles';


export default function UsersPage() {
  
  const [users, setUsers] = useState([]);
  const [userToken, setUserToken] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        setUserToken(idToken)
        console.log(idToken);
      }).catch(function(error) {
        console.error('Błąd podczas pobierania tokenu:', error);
      });
    }
    fetchUserRole();
  }, []);
  

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
              },
              {
                headers: {
                  'Authorization': 'Bearer ' + userToken
                }
              }
            );
              console.log(response.data);
              setSelectedUser(null)
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
      },
      {
        headers: {
          'Authorization': 'Bearer ' + userToken
        }
      }
    );
      console.log(response.data);
      setSelectedUser(null)
    } catch (error) {
      console.error('Błąd podczas wysyłania żądania usunięcia użytkownika:', error);
    }
  };
}

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

const selectUser = (userId) => {
  setSelectedUser(userId);
  console.log(userId)
};

return (
  <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
      <Drawer.Screen
        options={{
          title: "Użytkownicy",
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />
        }} />
      <PageTitle>Lista użytkowników</PageTitle>
      <Link href="/(drawer)/users/add_user" asChild style={styles.button}>
        <Pressable>
          <Text style={styles.buttonText}>Dodaj użytkownika</Text>
        </Pressable>
      </Link>
      <View style={styles.upperPanel}>
        <Text style={styles.sectionTitle}>Wybierz użytkownika:</Text>
        {users.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.userItem,
              selectedUser === item.id && styles.selectedUserItem
            ]}
            onPress={() => selectUser(item.id)}
          >
            {Platform.OS !== 'web' ? (
              <Text style={[styles.userEmail, selectedUser === item.id && styles.selectedText]}>{item.email}</Text>
            ) : (
              <>
                <Text style={[styles.userEmail, selectedUser === item.id && styles.selectedText]}>{item.email}</Text>
                <Text style={[styles.userID, selectedUser === item.id && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        {selectedUser && (
          <Link href={`/(drawer)/users/edit_user?id=${selectedUser}`} asChild style={styles.button}>
            <Pressable>
              <Text style={styles.buttonText}>Edytuj użytkownika</Text>
            </Pressable>
          </Link>
        )}
        {selectedUser && (
          <StyledButton onPress={() => {Platform.OS == "web" ? deleteUserWeb(selectedUser) : deleteUserMobile(selectedUser)}} style={styles.button}>
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
  paddingHorizontal: '15%',
},
containerOS: {
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
userItem: {
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
selectedUserItem: {
  backgroundColor: '#6D28D9',
},
userID: {
  fontSize: 14,
  color: '#666',
},
userEmail: {
  fontSize: 14,
  fontWeight: 'bold',
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
