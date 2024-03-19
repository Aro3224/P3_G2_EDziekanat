import React, { useState } from 'react';
import { Text, View, StyleSheet, Button,SafeAreaView, TextInput, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database'; 

export default function AddUserPage() {
  const [userEmail, onChangeEmail] = useState('');
  const [userPass, onChangePass] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const addUser = () => {
    setEmailError('');
    setPassError('');

    if (!validateEmail(userEmail)) {
      setEmailError('Podaj poprawny adres e-mail.');
      return;
    }

    if (!validatePassword(userPass)) {
      setPassError('Hasło musi składać się z co najmniej 6 znaków.');
      return;
    }

    auth()
    .createUserWithEmailAndPassword(userEmail, userPass)
    .then((userCredential) => {

      const uid = userCredential.user.uid;
      console.log('User account created & signed in!');
      database()
      .ref(`/users/${uid}`)
      .set({ email: userEmail })
      .then(() => {
        console.log('UID użytkownika zostało dodane do bazy danych.');
      onChangeEmail("");
      onChangePass("");
      Alert.alert("Dodano użytkownika","Użytkownik został dodany do systemu")
      })
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
        setEmailError('Ten adres e-mail jest już używany.');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
        setEmailError('Ten adres e-mail jest nieprawidłowy.');
      }

      console.error(error);
    });
  }

  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Dodaj użytkownika", 
        headerShown: true, 
        }}/>
      <SafeAreaView>
        <Text>Podaj adres e-mail:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={onChangeEmail}
          value={userEmail}
          placeholder='E-mail'
          autoComplete='email'
          keyboardType='email-address'
        />
        <Text style={styles.errorText}>{emailError}</Text>
        <Text>Podaj hasło:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={onChangePass}
          value={userPass}
          placeholder="Hasło"
          autoComplete='off'
          secureTextEntry={true}
        />
        <Text style={styles.errorText}>{passError}</Text>
      </SafeAreaView>
      <Button title='Dodaj' onPress={addUser}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
