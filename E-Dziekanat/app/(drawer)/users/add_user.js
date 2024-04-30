import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button,SafeAreaView, TextInput, Alert } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth} from "firebase/auth";
import { ref, get } from "firebase/database";
import axios from 'axios';
import { Checkbox } from 'react-native-paper';


export default function AddUserPage() {
  const [userEmail, onChangeEmail] = useState('');
  const [userPass, onChangePass] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [userToken, setUserToken] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [textNameValue, setTextNameValue] = useState("");
  const [textSurnameValue, setTextSurnameValue] = useState("");
  const [nameError, setNameError] = useState('');
  const [surnameError, setSurnameError] = useState('');
  const [checkedWykladowca, setCheckedWykladowca] = useState(false);
  const [checkedPracownik, setCheckedPracownik] = useState(false);
  const [textRoleValue, setTextRoleValue] = useState("");
  const [roleError, setRoleError] = useState('');



  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        setUserToken(idToken)
        console.log(userToken);
      }).catch(function(error) {
        console.error('Błąd podczas pobierania tokenu:', error);
      });
    }
    fetchUserRole();
  }, []);


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };



  const createUser = async (userEmail, userPass, userToken, userName, userSurname, userRole) => {

    setEmailError('');
    setPassError('');
    setNameError('');
    setSurnameError('');
    setRoleError('');

    if (!validateEmail(userEmail)) {
      setEmailError('Podaj poprawny adres e-mail.');
      return;
    }

    if (!validatePassword(userPass)) {
      setPassError('Hasło musi składać się z co najmniej 6 znaków.');
      return;
    }

    if (userName == "") {
      setNameError('Wprowadź imię');
      return;
    }

    if (userSurname == "") {
      setSurnameError('Wprowadź nazwisko');
      return;
    }

    if (userSurname == "") {
      setSurnameError('Wprowadź nazwisko');
      return;
    }

    if (userRole == "") {
      setRoleError('Wybierz role');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/create-user/', {
        email: userEmail,
        password: userPass,
        Imie: userName,
        Nazwisko: userSurname,
        Role: userRole,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + userToken
        }
      }
    );
      console.log(response.data);
      onChangeEmail("");
      onChangePass("");
      setTextNameValue("");
      setTextSurnameValue("");
      setTextRoleValue("")
      setCheckedPracownik(false)
      setCheckedWykladowca(false)
    } catch (error) {
      console.error('Błąd podczas wysyłania żądania utworzenia użytkownika:', error);
      alert("Wystąpił błąd podczas dodawania użytkownika. Spróbuj ponownie później.")
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

  const handleRoleCheckbox = (role) => {
    if (role === 'wykladowca') {
        setCheckedWykladowca(true);
        setCheckedPracownik(false);
        setTextRoleValue("Wykładowca")
    } else if (role === 'pracownik') {
        setCheckedWykladowca(false);
        setCheckedPracownik(true);
        setTextRoleValue("Pracownik")
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
        <Text>Podaj imię:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={setTextNameValue}
          value={textNameValue}
          placeholder="Imię"
        />
        <Text style={styles.errorText}>{nameError}</Text>
        <Text>Podaj nazwisko:</Text>
        <TextInput
          //style={styles.input}
          onChangeText={setTextSurnameValue}
          value={textSurnameValue}
          placeholder="Naziwsko"
        />
        <Text style={styles.errorText}>{surnameError}</Text>
        <View style={styles.checkboxContainer}>
                <Checkbox
                    status={checkedWykladowca ? 'checked' : 'unchecked'}
                    onPress={() => handleRoleCheckbox('wykladowca')}
                />
                <Text>Wykładowca</Text>
            </View>
            <View style={styles.checkboxContainer}>
                <Checkbox
                    status={checkedPracownik ? 'checked' : 'unchecked'}
                    onPress={() => handleRoleCheckbox('pracownik')}
                />
                <Text>Pracownik</Text>
            </View>
            <Text style={styles.errorText}>{roleError}</Text>
      </SafeAreaView>
      <Button title='Dodaj' onPress={() => createUser(userEmail, userPass, userToken, textNameValue, textSurnameValue, textRoleValue)}/>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},
});
