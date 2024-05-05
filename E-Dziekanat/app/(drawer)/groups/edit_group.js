import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { get, ref, update, onValue } from 'firebase/database';
import { db, auth } from '../../../components/configs/firebase-config';
import { StyledButton, ButtonText, MsgBox, StyledTextInput, PageTitle, StyledInputLabel, } from '../../../components/styles';

export default function EditGroupPage() {
    const route = useRoute();
    const groupId = route.params?.id;
    const path = 'groups/'+ groupId;
    const [users, setUsers] = useState([]);
    const [checkedUsers, setCheckedUsers] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const groupRef = ref(db, path);
        onValue(groupRef, (snapshot) => {
            const groupData = snapshot.val();
            if (groupData && groupData.Users) {
                const initialCheckedUsers = {};
                groupData.Users.forEach(userId => {
                    initialCheckedUsers[userId] = true;
                });
                setCheckedUsers(initialCheckedUsers);
            }
        });

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

        fetchUserRole();
    }, []);
    
    
    
    
      const EditGroup = () => {
        const numberOfCheckedUsers = Object.values(checkedUsers).filter(isChecked => isChecked).length;
        if (numberOfCheckedUsers <= 1) {
          setErrorMessage("Musisz wybrać co najmniej dwóch wykładowców");
          return;
        } else {
          setErrorMessage("");
        }
        const updatedCheckedUserIds = Object.entries(checkedUsers)
          .filter(([userId, isChecked]) => isChecked)
          .map(([userId]) => userId);

        const groupData = {
          Users: updatedCheckedUserIds
        };

        update(ref(db, path), groupData)
          .then(() => {
            update(ref(db, path), { Grupa: null })
            .then(() => {
                alert("Grupa została edytowana");
              })
            .catch(error => {
                console.error(`Error:`, error);
            });
          })
          .catch((error) => {
            console.error('Error:', error);
            alert("Wystąpił błąd podczas edytowania grupy. Spróbuj ponownie później.");
          });
      };
      
      
      const selectUser = (userId) => {
        const updatedCheckedUsers = { ...checkedUsers };
        updatedCheckedUsers[userId] = !updatedCheckedUsers[userId];
        setCheckedUsers(updatedCheckedUsers);
        console.log(userId, 'Checked:', updatedCheckedUsers[userId]);
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
    
      return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <Drawer.Screen 
              options={{ 
              title:"Edytuj grupę", }} />
          <PageTitle>Edytuj grupę</PageTitle>
          <StyledInputLabel>Nazwa grupy</StyledInputLabel>
            <StyledTextInput 
              style={styles.input}
              value={groupId}
              editable={false}
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
                    <Text style={[styles.userName, checkedUsers[item.id] && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
                  ) : (
                    <>
                      <Text style={[styles.userID, checkedUsers[item.id] && styles.selectedText]}>{item.email}</Text>
                      <Text style={[styles.userName, checkedUsers[item.id] && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
                    </>
                  )}
              
            </TouchableOpacity>
            ))}
          </View>
          <StyledButton onPress={EditGroup}>
            <ButtonText>Zapisz</ButtonText>
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