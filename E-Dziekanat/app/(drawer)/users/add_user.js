import React, { useState } from 'react';
import { Text, View, StyleSheet, Button,SafeAreaView, TextInput, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import axios from 'axios';


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



  const createUser = async (userEmail, userPass) => {

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

    try {
      const response = await axios.post('http://localhost:8000/api/create-user/', {
        email: userEmail,
        password: userPass,
      });
      console.log(response.data);
      onChangeEmail("");
      onChangePass("");
    } catch (error) {
      console.error('Błąd podczas wysyłania żądania utworzenia użytkownika:', error);
    }
  };


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
      <Button title='Dodaj' onPress={() => createUser(userEmail, userPass)}/>
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
