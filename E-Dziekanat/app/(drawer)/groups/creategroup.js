import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { Drawer } from 'expo-router/drawer';
import { get, child, ref, update } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';

export default function NextPage() {
  const [userData, setUserData] = useState(null);
  const [checkedUsers, setCheckedUsers] = useState(false);
  const [textGroupNameValue, setTextGroupNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    ReadData();
  }, []);

  const ReadData = async () => {
    try {
      const snapshot = await get(child(ref(db), 'Users'));
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        alert("Brak wykładowców")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const SaveGroup = () => {
    const numberOfCheckedUsers = Object.values(checkedUsers).filter(isChecked => isChecked).length;
    if (!textGroupNameValue) {
      setErrorMessage("Wprowadź nazwę grupy");
      return;
    } else {
      setErrorMessage("");
    }
    if (numberOfCheckedUsers <= 1) {
      setErrorMessage("Musisz wybrać co najmniej dwóch wykładowców");
      return;
    } else {
      setErrorMessage("");
    }
    Object.entries(checkedUsers).forEach(([userId, isChecked]) => {
      if (isChecked) {
        update(ref(db, `Users/${userId}`), {
          Grupa: textGroupNameValue
        }).then(() => {
          console.log(`Group Saved for User: ${userId}`);
        }).catch((error) => {
          console.error(`Error updating group for User: ${userId}`, error);
        });
      }
    });
    alert("Grupa została utworzona");
  };
  
  const handleUserCheckbox = (userId) => {
    const updatedCheckedUsers = { ...checkedUsers };
    updatedCheckedUsers[userId] = !updatedCheckedUsers[userId];
    setCheckedUsers(updatedCheckedUsers);
    console.log(userId, 'Checked:', updatedCheckedUsers[userId]);
  };

  return (
    <View style={styles.container}>
      <Drawer.Screen 
          options={{ 
          title:"Utwórz grupę", }} />
      <Text style={styles.subtitle}>Utwórz grupę</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nazwa Grupy:</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz nazwę grupy.."
          value={textGroupNameValue}
          onChangeText={setTextGroupNameValue}
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
      <TouchableOpacity style={styles.button} onPress={SaveGroup}>
        <Text style={styles.buttonText}>Utwórz</Text>
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
    width: '10%',
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 15,
  },
});
