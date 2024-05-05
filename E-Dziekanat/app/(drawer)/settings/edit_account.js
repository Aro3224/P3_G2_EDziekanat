import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get, update } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';
import { Link } from 'expo-router';
import { StyledButton, ButtonText, MsgBox, StyledTextInput, PageTitle, StyledInputLabel, } from '../../../components/styles';


export default function EditAccountPage() {
    const route = useRoute();
    const userId = route.params?.id;
    const path = 'users/'+ userId;
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    const [message, setMessage] = useState("");


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
    }, []);

    const editUser = async () => {
        if (textEmailValue != "" && textNameValue != "" && textSurnameValue != "" && textPhoneValue != "") {
            update(ref(db, `users/${userId}/`), {
                Imie: textNameValue,
                Nazwisko: textSurnameValue,
                NrTelefonu: textPhoneValue
              }).then(() => {
                // Data saved successfully!
                alert("Dane zostały zaaktualizowane");
                setMessage("");
                })
                .catch((error) => {
                alert("Wystąpił błąd podczas aktualizacji danych");
                console.log(error)
            });
        } else {
            setMessage("Musisz uzupełnić wszystkie pola");
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
            <Drawer.Screen 
                options={{ 
                    title:"Edycja danych", 
                    headerShown: true, 
                }}
            />
            <PageTitle>Edytuj swoje dane</PageTitle>
            <StyledInputLabel>E-mail</StyledInputLabel>
            <StyledTextInput
                style={styles.input}
                placeholder="Wpisz email użytkownika.."
                value={textEmailValue}
                onChangeText={setTextEmailValue}
                editable={false}
            />
            <StyledInputLabel>Imię</StyledInputLabel>
            <StyledTextInput
                style={styles.input}
                placeholder="Wpisz swoje imię.."
                value={textNameValue}
                onChangeText={setTextNameValue}
            />
            <StyledInputLabel>Nazwisko</StyledInputLabel>
            <StyledTextInput
                style={styles.input}
                placeholder="Wpisz swoje nazwisko.."
                value={textSurnameValue}
                onChangeText={setTextSurnameValue}
            />
            <StyledInputLabel>Numer Telefonu</StyledInputLabel>
            <StyledTextInput
                style={styles.input}
                placeholder="Wpisz swój numer telefonu.."
                value={textPhoneValue}
                onChangeText={setTextPhoneValue}
            />
            <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
                <Link href={`/(drawer)/settings`} asChild style={styles.button}>
                    <Pressable>
                        <Text style={styles.buttonText}>Anuluj</Text>
                    </Pressable>
                </Link>
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
    input: {
        width: '50%',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '51.5%',
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
      },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorMessage: {
        color: 'red',
        fontSize: 18,
    },
});
