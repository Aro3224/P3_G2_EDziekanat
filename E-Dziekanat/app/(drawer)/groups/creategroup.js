import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { get, ref, update, onValue, } from 'firebase/database';
import { db, auth } from '../../../components/configs/firebase-config';
import { StyledButton, ButtonText, MsgBox, StyledTextInput, PageTitle, StyledInputLabel, } from '../../../components/styles';

export default function NextPage() {
  const [users, setUsers] = useState([]);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const [textGroupNameValue, setTextGroupNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
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

  const SaveGroup = () => {
    const selectedUserIds = Object.entries(checkedUsers)
      .filter(([userId, isChecked]) => isChecked)
      .map(([userId]) => userId);
  
    if (!textGroupNameValue) {
      setErrorMessage("Wprowadź nazwę grupy");
      return;
    } else {
      setErrorMessage("");
    }
  
    if (selectedUserIds.length < 2) {
      setErrorMessage("Musisz wybrać co najmniej dwóch wykładowców");
      return;
    } else {
      setErrorMessage("");
    }
  
    const groupData = {
      Users: selectedUserIds
    };
  
    update(ref(db, `groups/${textGroupNameValue}`), groupData)
      .then(() => {
        alert("Grupa została utworzona");
      })
      .catch((error) => {
        console.error('Error:', error);
        alert("Wystąpił błąd podczas tworzenia grupy. Spróbuj ponownie później.");
      });
  };

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser
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
    const updatedCheckedUsers = { ...checkedUsers };
    updatedCheckedUsers[userId] = !updatedCheckedUsers[userId];
    setCheckedUsers(updatedCheckedUsers);
    console.log(userId, 'Checked:', updatedCheckedUsers[userId]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <Drawer.Screen 
          options={{ 
          title:"Utwórz grupę", }} />
      <PageTitle>Utwórz grupę</PageTitle>
      <StyledInputLabel>Nazwa grupy</StyledInputLabel>
        <StyledTextInput 
          style={styles.input}
          onChangeText={setTextGroupNameValue}
          value={textGroupNameValue}
          placeholder="Wpisz nazwę grupy.."
        />
      <View style={styles.upperPanel}>
        <Text style={styles.sectionTitle}>Wybierz użytkowników:</Text>
        {users.map((item) => (
          <TouchableOpacity
          key={item.id}
          style={[
            styles.userItem,
            checkedUsers[item.id] && styles.selectedUserItem
          ]}
          onPress={() => selectUser(item.id)}
        >
          {Platform.OS !== 'web' ? (
                <Text style={[styles.Name, styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
              ) : (
                <>
                  <Text style={[styles.userID, checkedUsers[item.id] && styles.selectedText]}>{item.email}</Text>
                  <Text style={[styles.userName, checkedUsers[item.id] && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
                </>
              )}
          
        </TouchableOpacity>
        ))}
      </View>
      <StyledButton onPress={SaveGroup}>
        <ButtonText>Utwórz</ButtonText>
      </StyledButton>
      <MsgBox style={styles.errorMessage}>{errorMessage}</MsgBox>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
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
  userName: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  selectedText: {
    color: '#fff',
  },
  errorMessage: {
    color: 'red',
    fontSize: 18,
},
input: {
  width: '50%',
  borderWidth: 1,
  borderColor: '#ccc',
  paddingHorizontal: 10,
  marginBottom: 20,
},
});
