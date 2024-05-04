import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get } from 'firebase/database';
import { db, auth } from '../../../components/configs/firebase-config';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import { MsgBox, StyledButton, ButtonText, StyledTextInput, PageTitle, StyledInputLabel, SelectRoleButton, RoleList, Divider } from '../../../components/styles';


export default function EditUserPage() {
    const route = useRoute();
    const userId = route.params?.id;
    const path = 'users/'+ userId;
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPasswordValue, setTextPasswordValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPasswordEditable, setIsPasswordEditable] = useState(false);
    const [placeHolderValue, setPlaceHolderValue] = useState("Edycja hasła zablokowana");
    const [textRoleValue, setTextRoleValue] = useState("");
    const [userToken, setUserToken] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [message, setMessage] = useState("");
    const [showRoleList, setShowRoleList] = useState(false);

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
      }, []);

    useEffect(() => {
        const readData = async () => {
            try {
                const snapshot = await get(ref(db, path));
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setTextEmailValue(userData?.email || '');
                    setTextNameValue(userData?.Imie || '');
                    setTextSurnameValue(userData?.Nazwisko || '');
                    setTextPhoneValue(userData?.NrTelefonu || '');
                    if (userData?.Rola == "Wykładowca"){
                        setTextRoleValue("Wykładowca")
                    }else if(userData?.Rola == "Pracownik"){
                        setTextRoleValue("Pracownik")
                    }
                } else {
                    alert("Wykładowca nie istnieje");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        readData();

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
        fetchUserRole();
    }, []);

    const editUser = async () => {
        if (textRoleValue !== "") {
            if (isPasswordEditable) {
                if (textPasswordValue.length >= 6) {
                    try {
                        const response = await axios.post('http://localhost:8000/api/edit-user/', {
                            UID: userId,
                            email: textEmailValue,
                            password: textPasswordValue,
                            Imie: textNameValue,
                            Nazwisko: textSurnameValue,
                            NrTelefonu: textPhoneValue,
                            Role: textRoleValue,
                        },
                        {
                          headers: {
                            'Authorization': 'Bearer ' + userToken
                          }
                        });
                        console.log(response.data);
                        setMessage("");
                        alert("Dane zostały zaaktualizowane");
                    } catch (error) {
                        console.error('Błąd podczas wysyłania żądania edycji użytkownika:', error);
                        setMessage("Wystąpił błąd podczas aktualizacji danych");
                    }
                } else {
                    setMessage("Hasło jest za krótkie");
                }
            } else {
                try {
                    const response = await axios.post('http://localhost:8000/api/edit-user/', {
                        UID: userId,
                        email: textEmailValue,
                        Imie: textNameValue,
                        Nazwisko: textSurnameValue,
                        NrTelefonu: textPhoneValue,
                        Role: textRoleValue,
                    },
                    {
                      headers: {
                        'Authorization': 'Bearer ' + userToken
                      }
                    });
                    console.log(response.data);
                    setMessage("");
                    alert("Dane zostały zaaktualizowane");
                } catch (error) {
                    console.error('Błąd podczas wysyłania żądania edycji użytkownika:', error);
                    setMessage("Wystąpił błąd podczas aktualizacji danych");
                }
            }
        } else {
            setMessage("Wybierz stanowisko pracownika");
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    const setPasswordEditable = () => {
        setIsPasswordEditable(!isPasswordEditable);
        if (isPasswordEditable) { 
            setTextPasswordValue("");
            setPlaceHolderValue("Edycja hasła zablokowana");
        }else{
            setPlaceHolderValue("Wprowadź nowe hasło (co najmniej 6 znaków)");
        }
    };
    
    if (redirect) {
        const link = document.createElement('a');
        link.href = "/(drawer)/home";
        link.click();
    }

    const deleteDataWeb = async () => {
        const confirmation = window.confirm('Czy na pewno chcesz usunąć dane?');
        if (confirmation) {
        try {
          const response = await axios.post('http://localhost:8000/api/delete-data/', {
            UID: userId,
          },
          {
            headers: {
              'Authorization': 'Bearer ' + userToken
            }
          }
        );
          console.log(response.data);
          setTextNameValue("")
          setTextSurnameValue("")
          setTextPhoneValue("")
        } catch (error) {
          console.error('Błąd podczas wysyłania żądania usunięcia użytkownika:', error);
        }
      };
    }


    const deleteDataMobile = () => {
        Alert.alert(
          'Potwierdzenie',
          'Czy na pewno chcesz usunąć dane tego użytkownika?',
          [
            { text: 'Anuluj', style: 'cancel' },
            {
              text: 'Usuń',
              onPress: async () => {
                try {
                  const response = await axios.post('http://localhost:8000/api/delete-data/', {
                    UID: userId,
                  },
                  {
                    headers: {
                      'Authorization': 'Bearer ' + userToken
                    }
                  }
                );
                  console.log(response.data);
                  setTextNameValue("")
                  setTextSurnameValue("")
                  setTextPhoneValue("")
                } catch (error) {
                  console.error('Błąd podczas wysyłania żądania usunięcia użytkownika:', error);
                  Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania użytkownika. Spróbuj ponownie później.');
                }
                  
                
              },
            },
          ],
          { cancelable: false }
        );
      };

      const toggleRoleList = () => {
        setShowRoleList(!showRoleList);
    };

    const selectRole = (role) => {
      if (role === 'wykladowca') {
          setTextRoleValue("Wykładowca")
      } else if (role === 'pracownik') {
          setTextRoleValue("Pracownik")
      }
      setShowRoleList(false); // Hide the role list after selection
  };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Drawer.Screen 
                    options={{ 
                        title:"Edytuj użytkownika", 
                        headerShown: true, 
                    }}
                />
                <PageTitle>Edytuj użytkownika</PageTitle>
                <StyledInputLabel>E-mail</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz email użytkownika.."
                    value={textEmailValue}
                    onChangeText={setTextEmailValue}
                />
                <StyledInputLabel>Hasło</StyledInputLabel>
                <StyledTextInput 
                    style={[styles.input, !isPasswordEditable && styles.inputLocked]}
                    placeholder={placeHolderValue}
                    value={textPasswordValue}
                    onChangeText={setTextPasswordValue}
                    editable={isPasswordEditable}
                />
                <StyledInputLabel>Imię</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz imię użytkownika.."
                    value={textNameValue}
                    onChangeText={setTextNameValue}
                />
                <StyledInputLabel>Nazwisko</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz nazwisko użytkownika.."
                    value={textSurnameValue}
                    onChangeText={setTextSurnameValue}
                />
                <StyledInputLabel>Numer telefonu</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz numer telefonu użytkownika..."
                    value={textPhoneValue}
                    onChangeText={setTextPhoneValue}
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
                <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
                <StyledButton onPress={() => {Platform.OS == "web"?deleteDataWeb():deleteDataMobile()}}>
                    <ButtonText>Usuń dane</ButtonText>
                </StyledButton>
                <StyledButton onPress={setPasswordEditable}>
                    <ButtonText>{isPasswordEditable ? 'Naciśnij aby anulować edycje hasła' : 'Naciśnij aby edytować hasło'}</ButtonText>
                </StyledButton>
                <StyledButton onPress={editUser}>
                    <ButtonText>Zapisz</ButtonText>
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
        flexDirection: 'row',
        width: '53%',
        paddingHorizontal: 20,
        marginTop: 15,
        justifyContent: 'space-between'
    },
    buttonContainerOS: {
      marginTop: 15,
    },
    roleListItem: {
      marginTop: 5,
      marginBottom: 5,
  },
});
