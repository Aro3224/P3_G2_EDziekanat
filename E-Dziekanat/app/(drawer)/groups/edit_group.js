import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { get, child, ref, update, onValue } from 'firebase/database';
import { db, auth } from '../../../components/configs/firebase-config';
import { Checkbox } from 'react-native-paper';

export default function EditGroupPage() {
    const route = useRoute();
    const groupId = route.params?.id;
    const path = 'groups/'+ groupId;
    const [userData, setUserData] = useState(null);
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
        ReadData();
        fetchUserRole();
    }, []);
    
    
      const ReadData = async () => {
        try {
          const snapshot = await get(child(ref(db), 'users'));
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            alert("Brak wykładowców")
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
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
      
      
      const handleUserCheckbox = (userId) => {
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
        <View style={styles.container}>
          <Drawer.Screen 
              options={{ 
              title:"Utwórz grupę", }} />
          <Text style={styles.subtitle}>Edytuj grupę</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nazwa Grupy:</Text>
            <TextInput
              style={styles.input}
              placeholder="Wpisz nazwę grupy.."
              value={groupId}
              editable={false} 
            />
          </View>
          <View style={styles.userDataContainer}>
            {userData && (
              <>
                {Object.entries(userData).map(([userId, userData]) => (
                  <View key={userId}>
                    <View style={styles.userItem}>
                      <Text style={styles.userText}>{`${userData.Imie} ${userData.Nazwisko}`}</Text>
                      <Checkbox
                        status={checkedUsers[userId] ? 'checked' : 'unchecked'}
                        onPress={() => handleUserCheckbox(userId)}
                      />
                    </View>
                    <View style={styles.divider} />
                  </View>
                ))}
              </>
            )}
      </View>
         <TouchableOpacity style={styles.button} onPress={EditGroup}>
         <Text style={styles.buttonText}>Zapisz zmiany</Text>
       </TouchableOpacity>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
     </View>
    );
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
},
    subtitle: {
        fontSize: 36,
        marginBottom: 20,
        fontWeight: 'bold',
},
    userDataContainer: {
        marginTop: 20,
        backgroundColor: '#c9d7ff',
        padding: 10,
        borderRadius: 5,
        width: '50%',
},
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 10,
},
    userText: {
        marginRight: 10,
        fontSize: 15
},
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'black',
},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '30%',
},
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
},
    label: {
        marginRight: 10,
        fontSize: 16,
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
    errorMessage: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
        fontSize: 15,
    },
});