import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, get, update } from "firebase/database";
import { auth, db } from '../../../components/configs/firebase-config'
import { MsgBox } from '../../../components/styles';
import { Redirect, Link } from 'expo-router';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";


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
                    if (userData?.NrTelefonu == null || userData?.Imie == null || userData?.Nazwisko == null) {
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
                                        NrTelefonu: textPhoneValue
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
        const link = document.createElement('a');
        link.href = "/(drawer)/home";
        link.click();
    }

    return (
        <View style={styles.container}>
            <Drawer.Screen
                options={{
                    title: "Uzupełnij Dane",
                }} />
            <Text style={styles.subtitle}>Uzupełnij swoje dane</Text>
            <TextInput
                style={styles.input}
                placeholder="Wpisz swój email"
                value={textEmailValue}
                onChangeText={setTextEmailValue}
                editable={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Wprowadź stare hasło"
                value={textCurrentPassword}
                onChangeText={setCurrentPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Wprowadź nowe hasło (co najmniej 6 znaków)"
                value={textPasswordValue}
                onChangeText={setTextPasswordValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Potwierdź nowe hasło"
                value={textRepeatPasswordValue}
                onChangeText={setTextRepeatPasswordValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swoje imię"
                value={textNameValue}
                onChangeText={setTextNameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swoje nazwisko"
                value={textSurnameValue}
                onChangeText={setTextSurnameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swój numer telefonu"
                value={textPhoneValue}
                onChangeText={setTextPhoneValue}
            />
            <MsgBox style={styles.errorMessage}>{message}</MsgBox>
            <TouchableOpacity style={styles.button} onPress={editUser}>
                <Text style={styles.buttonText}>Zapisz</Text>
            </TouchableOpacity>
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
    subtitle: {
        fontSize: 36,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        width: '50%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        marginBottom: 20,
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
    inputLocked: {
        borderColor: 'orange'
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorMessage: {
        color: 'red',
        fontSize: 18,
    }
});