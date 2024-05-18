import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable,TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { onValue, ref, set, remove, get } from "firebase/database";
import { StyledButton, ButtonText, PageTitle } from '../../../components/styles';

export default function ButtonsPage() {

  const [buttons, setButtons] = useState([]);
  const [newButtonData, setNewButtonData] = useState({userID: ''});
  const [redirect, setRedirect] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    const buttonsRef = ref(db, '/buttons');
    onValue(buttonsRef, (snapshot) => {
      const buttonsData = snapshot.val();
      if (buttonsData) {
        const buttonsArray = Object.keys(buttonsData).map(async key => {
          const button = buttonsData[key];
          if (button.type === 'user') {
            const userEmailRef = ref(db, `/users/${button.userID}/email`);
            const userEmailSnapshot = await get(userEmailRef);
            const userEmail = userEmailSnapshot.val();
            console.log("UserID:", button.userID, "Email:", userEmail);
            return {
              id: key,
              email: userEmail,
              ...button
            };
          } else {
            return {
              id: key,
              email: button.userID,
              ...button
            };
          }
        });
        Promise.all(buttonsArray).then(resolvedButtons => {
          setButtons(resolvedButtons.filter(button => button !== null));
        });
      }
    });
    fetchUserRole();
  }, []);
  
  

  const handleDeleteTemplate = () => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć ostatni przycisk?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              const maxId = Math.max(...buttons.map(button => parseInt(button.id)));
              await remove(ref(db, `/buttons/${maxId}`));
              const updatedButtons = buttons.filter(button => parseInt(button.id) !== maxId);
              setButtons(updatedButtons);
              setSelectedButton(null);
              console.log(`Przycisk o największym ID (${maxId}) został usunięty z bazy danych.`);
            } catch (error) {
              console.error('Błąd podczas usuwania przycisku:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania przycisku o największym ID. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  const handleDeleteTemplateWeb = async () => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć ostatni przycisk?');
    
    if (confirmation) {
      try {
        const maxId = Math.max(...buttons.map(button => parseInt(button.id)));
        await remove(ref(db, `/buttons/${maxId}`));
        const updatedButtons = buttons.filter(button => parseInt(button.id) !== maxId);
        setButtons(updatedButtons);
        setSelectedButton(null);
        console.log(`Przycisk o największym ID (${maxId}) został usunięty z bazy danych.`);
      } catch (error) {
        console.error('Błąd podczas usuwania przycisku:', error);
        Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania przycisku o największym ID. Spróbuj ponownie później.');
      }
    };
  }

  const addButton = async () => {
    try {
      const maxId = Math.max(...buttons.map(button => button.id));
      const newButtonId = maxId + 1;

      const newButtonRef = ref(db, `/buttons/${newButtonId}`);
      await set(newButtonRef, newButtonData);

      console.log('Przycisk został dodany do bazy danych.');
    } catch (error) {
      console.error('Błąd podczas dodawania przycisku:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas dodawania przycisku. Spróbuj ponownie później.');
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

  const selectButton = (buttonId) => {
    setSelectedButton(buttonId);
    console.log('Przycisk: ' + buttonId)
  };

  
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
      <Drawer.Screen 
        options={{ 
          title:"Przyciski", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <PageTitle>Przyciski</PageTitle>
      <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
      <Pressable style={styles.button} onPress={addButton}>
          <Text style={styles.buttonText}>Dodaj przycisk</Text>
        </Pressable>
        <StyledButton onPress={Platform.OS == "web"?handleDeleteTemplateWeb:handleDeleteTemplate}>
            <ButtonText>Usuń ostatni przycisk</ButtonText>
          </StyledButton>
          {selectedButton && (
          <Link href={`/(drawer)/buttons/edit_button?id=${selectedButton}`} asChild style={styles.button}>
            <Pressable>
              <Text style={styles.buttonText}>Edytuj wybrany przycisk</Text>
            </Pressable>
          </Link>
        )}
      </View>
      <View style={styles.upperPanel}>
        <Text style={styles.sectionTitle}>Wybierz przycisk:</Text>
        {buttons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={[
              styles.buttonItem,
              selectedButton === button.id && styles.selectedButtonItem
            ]}
            onPress={() => selectButton(button.id)}
          >
            {Platform.OS !== 'web' ? (
              <Text style={[styles.buttonID, selectedButton === button.id && styles.selectedText]}>Przycisk {button.id}</Text>
            ) : (
              <>
                <Text style={[styles.buttonID, selectedButton === button.id && styles.selectedText]}>Przycisk {button.id}</Text>
                <Text style={[styles.buttonMember, selectedButton === button.id && styles.selectedText]}>{button.email === '' ? 'Nie przypisano' : button.email}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
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
    paddingHorizontal: '15%',
    paddingVertical: 20,
  },
  containerOS: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  upperPanel: {
    width: '80%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  buttonItem: {
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
  selectedButtonItem: {
    backgroundColor: '#6D28D9',
  },
  buttonMember: {
    fontSize: 14,
    color: '#666',
  },
  buttonID: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '83%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'flex-start'
  },
  buttonContainerOS: {
    marginTop: 15,
  },
  button: {
    backgroundColor: "#6D28D9", 
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
});