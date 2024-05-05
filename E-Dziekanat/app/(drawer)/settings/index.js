import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Pressable, ScrollView, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Redirect, Link } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../../components/configs/firebase-config';
import { ref, get, update } from "firebase/database";
import { Checkbox } from 'react-native-paper';
import { StyledButton, ButtonText, MsgBox, PageTitle, Divider, SubTitle } from '../../../components/styles';

const auth = getAuth();

export default function SettingsPage({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userSurname, setUserSurname] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkedSMS, setCheckedSMS] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        setUserId(user?.uid || null)
        const path = 'users/'+ user?.uid;
        const snapshot = await get(ref(db, path));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(userData?.Imie || '');
          setUserSurname(userData?.Nazwisko || '');
          setCheckedSMS(userData?.SendSMS || false);
        }
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsAuthenticated(false);
        console.log("Wylogowano użytkownika");
      })
      .catch((error) => {
        console.error("Błąd podczas wylogowywania użytkownika:", error);
      });
  };

  const handleSMSCheckbox = (sendsms) => {
    if (sendsms === 'true') {
        setCheckedSMS(prevState => !prevState);
        const path = 'users/'+ userId;
        update(ref(db, path), {
          SendSMS: !checkedSMS
        }).then(() => {
          console.log('SendSMS updated')
        })
          .catch((error) => {
            alert(error);
          });
    }
  };

  if (!isAuthenticated) {
    return <Redirect href="../../" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title: "Ustawienia", 
          headerShown: true, 
          headerLeft: () => <DrawerToggleButton/>
        }}
      />
      <PageTitle>{userName} {userSurname}</PageTitle>
      <SubTitle>{userEmail}</SubTitle>
      <Divider style={styles.divider}></Divider>
          <View style={styles.checkboxContainer}>
                    <Text style={styles.text}>Powiadomienia SMS</Text>
                    <Checkbox
                        status={checkedSMS ? 'checked' : 'unchecked'}
                        onPress={() => handleSMSCheckbox('true')}
                    />
          </View>
      <Divider style={styles.divider}></Divider>
          <View style={styles.checkboxContainer}>
            <Text style={styles.text}>Wersja aplikacji</Text>
            <Text style={{fontSize: 16}}>1.0</Text>
          </View>
        <Divider style={styles.divider}></Divider>
        <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
          <StyledButton style={styles.buttonLogOut} onPress={handleLogout}>
            <ButtonText>Wyloguj</ButtonText>
          </StyledButton>
          <Link href={`/(drawer)/settings/edit_account?id=${userId}`} asChild style={styles.button}>
            <Pressable>
              <Text style={styles.buttonText}>Edytuj swoje dane</Text>
            </Pressable>
          </Link>
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
  },
  title: {
    fontSize: 36,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    width: '40%'
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
  buttonLogOut: {
    backgroundColor: "#CC0000", 
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
  divider: {
    width: '50%',
    marginTop: 20,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '50%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'space-between'
  },
  buttonContainerOS: {
    marginTop: 15,
  },
});
