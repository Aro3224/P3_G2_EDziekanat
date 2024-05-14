import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Platform, View, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { ref, get, update } from "firebase/database";
import { auth, db } from '../../../components/configs/firebase-config'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { MsgBox, StyledButton, ButtonText, StyledTextInput, PageTitle, StyledInputLabel, SelectRoleButton, RoleList, Divider } from '../../../components/styles';
import { useNavigation } from '@react-navigation/native';

export default function FillDataPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPasswordValue, setTextPasswordValue] = useState("");
    const [textRepeatPasswordValue, setTextRepeatPasswordValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [textCurrentPassword, setCurrentPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const readData = async () => {
            try {
                const user = auth.currentUser
                setUserId(user?.uid || null)
                const path = 'users/'+ user?.uid;
                const snapshot = await get(ref(db, path));
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setTextEmailValue(userData?.email || '');
                    setTextNameValue(userData?.Imie || '');
                    setTextSurnameValue(userData?.Nazwisko || '');
                    setTextPhoneValue(userData?.NrTelefonu || '');
                    if (userData?.IsFirstTimeLoggedIn === false || userData?.IsFirstTimeLoggedIn == null) {
                        setRedirect(false);
                    } else {
                        setRedirect(true);
                    }
                } else {
                    alert("Bład podczas pobierania danych");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        readData();
    }, []);

    const editUser = async () => {
        if (textEmailValue !== "" && textPasswordValue !== "" && textNameValue !== "" && textSurnameValue !== "" && textPhoneValue !== "" && textCurrentPassword !== "") {
            if (textPasswordValue === textRepeatPasswordValue && textPasswordValue.length >= 6) {
                const user = auth.currentUser;
    
                if (user) {
                    const credential = EmailAuthProvider.credential(textEmailValue, textCurrentPassword);
                    reauthenticateWithCredential(user, credential)
                        .then(() => {
                            updatePassword(user, textPasswordValue)
                                .then(() => {
                                    update(ref(db, `users/${userId}/`), {
                                        Imie: textNameValue,
                                        Nazwisko: textSurnameValue,
                                        NrTelefonu: textPhoneValue,
                                        IsFirstTimeLoggedIn: true
                                    }).then(() => {
                                        // Data saved successfully!
                                        setRedirect(true);
                                        alert("Hasło i dane zostały zaaktualizowane");
                                    }).catch((error) => {
                                        alert("Wystąpił błąd podczas aktualizacji danych");
                                        console.error(error);
                                    });
                                })
                                .catch((error) => {
                                    console.error("Błąd podczas aktualizacji hasła:", error);
                                    setMessage("Wystąpił błąd podczas aktualizacji hasła");
                                });
                        })
                        .catch((error) => {
                            console.error("Błąd podczas ponownej autentykacji:", error);
                            setMessage("Podano złe hasło");
                        });
                } else {
                    console.error("Niezidentyfikowany użytkownik ");
                }
            } else {
                setMessage('Podane hasła nie są takie same lub hasło jest za krótkie');
            }
        } else {
            setMessage('Uzupełnij wszystkie pola');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    if (redirect) {
        if(Platform.OS =='web'){
            const link = document.createElement('a');
            link.href = "/(drawer)/home";
            link.click();
        }{
            navigation.navigate('home');
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
            <Drawer.Screen
                options={{
                    title: "Uzupełnij Dane",
                }} />
                <PageTitle>Uzupełnij swoje dane</PageTitle>
                <StyledInputLabel>E-mail</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz swój email"
                    value={textEmailValue}
                    onChangeText={setTextEmailValue}
                    editable={false}
                />
                <StyledInputLabel>Stare hasło</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wprowadź stare hasło"
                    value={textCurrentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={true}
                />
                <StyledInputLabel>Nowe hasło</StyledInputLabel>
                <StyledTextInput
                    style={styles.input}
                    placeholder="Wprowadź nowe hasło (co najmniej 6 znaków)"
                    value={textPasswordValue}
                    onChangeText={setTextPasswordValue}
                    secureTextEntry={true}
                />
                <StyledInputLabel>Potwierdź hasło</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Potwierdź nowe hasło"
                    value={textRepeatPasswordValue}
                    onChangeText={setTextRepeatPasswordValue}
                    secureTextEntry={true}
                />
                <StyledInputLabel>Imię</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz swoje imię"
                    value={textNameValue}
                    onChangeText={setTextNameValue}
                />
                <StyledInputLabel>Nazwisko</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz swoje nazwisko"
                    value={textSurnameValue}
                    onChangeText={setTextSurnameValue}
                />
                <StyledInputLabel>Numer telefonu</StyledInputLabel>
                <StyledTextInput 
                    style={styles.input}
                    placeholder="Wpisz swój numer telefonu"
                    value={textPhoneValue}
                    onChangeText={setTextPhoneValue}
                />
                <View style={styles.buttonContainer}>
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
        marginTop: 15,
        justifyContent: 'center'
    },
    roleListItem: {
      marginTop: 5,
      marginBottom: 5,
    },
});