import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db, auth } from '../../../components/configs/firebase-config';
import { getAuth} from "firebase/auth";
import { ref, get } from "firebase/database";
import axios from 'axios';
import { MsgBox, StyledButton, ButtonText, StyledTextInput, PageTitle, StyledInputLabel, SelectRoleButton, RoleList, Divider } from '../../../components/styles';


export default function AddUserPage() {
  const [userEmail, onChangeEmail] = useState('');
  const [userPass, onChangePass] = useState('');
  const [userToken, setUserToken] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [textNameValue, setTextNameValue] = useState("");
  const [textSurnameValue, setTextSurnameValue] = useState("");
  const [textPhoneValue, setTextPhoneValue] = useState("");
  const [textRoleValue, setTextRoleValue] = useState("Wybierz rolę");
  const [showRoleList, setShowRoleList] = useState(false);
  const [message, setMessage] = useState("");



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



  const createUser = async (userEmail, userPass, userToken, userName, userSurname, userNumber, userRole) => {

    setMessage('');

    if (!validateEmail(userEmail)) {
      setMessage('Podaj poprawny adres e-mail.');
      return;
    }

    if (!validatePassword(userPass)) {
      setMessage('Hasło musi składać się z co najmniej 6 znaków.');
      return;
    }

    if (userName == "") {
      setMessage('Wprowadź imię');
      return;
    }

    if (userSurname == "") {
      setMessage('Wprowadź nazwisko');
      return;
    }

    if (userRole == "Wybierz rolę") {
      setMessage('Wybierz role');
      return;
    }

    if (userNumber == "") {
      setMessage('Wprowadź numer telefonu');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/create-user/', {
        email: userEmail,
        password: userPass,
        Imie: userName,
        Nazwisko: userSurname,
        NrTelefonu: userNumber,
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
      setTextPhoneValue("");
      setTextRoleValue("Wybierz rolę")
      alert("Użytkownik został dodany");
    } catch (error) {
      console.error('Błąd podczas wysyłania żądania utworzenia użytkownika:', error);
      setMessage("Wystąpił błąd podczas dodawania użytkownika. Spróbuj ponownie później.")
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

  const toggleRoleList = () => {
    setShowRoleList(!showRoleList);
  };

  const selectRole = (role) => {
  if (role === 'wykladowca') {
      setTextRoleValue("Wykładowca")
  } else if (role === 'pracownik') {
      setTextRoleValue("Pracownik")
  }
  setShowRoleList(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Drawer.Screen 
                    options={{ 
                        title:"Dodaj użytkownika", 
                        headerShown: true, 
                    }}
                />
                <PageTitle>Dodaj użytkownika</PageTitle>
                <StyledInputLabel>E-mail</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    onChangeText={onChangeEmail}
                    value={userEmail}
                    placeholder='E-mail'
                    autoComplete='email'
                    keyboardType='email-address'
                />
                <StyledInputLabel>Hasło</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    onChangeText={onChangePass}
                    value={userPass}
                    placeholder="Hasło"
                    autoComplete='off'
                    secureTextEntry={true}
                />
                <StyledInputLabel>Imię</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    onChangeText={setTextNameValue}
                    value={textNameValue}
                    placeholder="Imię"
                />
                <StyledInputLabel>Nazwisko</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    onChangeText={setTextSurnameValue}
                    value={textSurnameValue}
                    placeholder="Naziwsko"
                />
                <StyledInputLabel>Numer Telefonu</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    onChangeText={setTextPhoneValue}
                    value={textPhoneValue}
                    placeholder="Numer Telefonu"
                />
                <StyledInputLabel>Rola</StyledInputLabel>
                <SelectRoleButton onPress={toggleRoleList}>
                  <Text>{textRoleValue}</Text>
                </SelectRoleButton>
                    
                {showRoleList && (
                    <RoleList>
                        <TouchableOpacity onPress={() => selectRole('wykladowca')}>
                            <Text style={styles.roleListItem}>Wykładowca</Text>
                        </TouchableOpacity>
                        <Divider></Divider>
                        <TouchableOpacity onPress={() => selectRole('pracownik')}>
                            <Text style={styles.roleListItem}>Pracownik</Text>
                        </TouchableOpacity>
                    </RoleList>
                )}
                <View style={styles.buttonContainer}>
                <StyledButton onPress={() => createUser(userEmail, userPass, userToken, textNameValue, textSurnameValue, textPhoneValue, textRoleValue)}>
                    <ButtonText>Dodaj</ButtonText>
                </StyledButton>
            </View>
                <MsgBox style={styles.errorMessage}>{message}</MsgBox>
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
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
},
input: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 20,
},
inputLocked: {
    borderColor: 'orange'
},
errorMessage: {
    color: 'red',
    fontSize: 18,
},
buttonContainer: {
    marginTop: 15,
    justifyContent: 'center'
},
roleListItem: {
  marginTop: 5,
  marginBottom: 5,
},
});
