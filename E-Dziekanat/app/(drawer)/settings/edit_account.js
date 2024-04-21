import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';
import axios from 'axios';
import { Link } from 'expo-router';


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
            try {
                const response = await axios.post('http://localhost:8000/api/edit-user/', {
                    UID: userId,
                    email: textEmailValue,
                    Imie: textNameValue,
                    Nazwisko: textSurnameValue,
                    NrTelefonu: textPhoneValue,
                },
                {
                    headers: {
                    'Authorization': 'Bearer ' + userToken
                    }
                });
                console.log(response.data);
                alert("Dane zostały zaaktualizowane");
            } catch (error) {
                  console.error('Błąd podczas wysyłania żądania edycji użytkownika:', error);
                alert("Wystąpił błąd podczas aktualizacji danych");
            }
        } else {
            alert("Musisz uzupełnić wszystkie pola");
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
        <View style={styles.container}>
            <Drawer.Screen 
                options={{ 
                    title:"Edytuj użytkownika", 
                    headerShown: true, 
                }}
            />
            <Text style={styles.subtitle}>Edytuj swoje dane</Text>
            <TextInput
                style={styles.input}
                placeholder="Wpisz email użytkownika.."
                value={textEmailValue}
                onChangeText={setTextEmailValue}
                editable={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swoje imię.."
                value={textNameValue}
                onChangeText={setTextNameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swoje nazwisko.."
                value={textSurnameValue}
                onChangeText={setTextSurnameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz swój numer telefonu.."
                value={textPhoneValue}
                onChangeText={setTextPhoneValue}
            />
            <View style={styles.buttonContainer}>
                <Link href={`/(drawer)/settings`} asChild style={styles.button}>
                    <Pressable>
                        <Text style={styles.buttonText}>Anuluj</Text>
                    </Pressable>
                </Link>
                <TouchableOpacity style={styles.button} onPress={editUser}>
                    <Text style={styles.buttonText}>Zapisz</Text>
                </TouchableOpacity>
            </View>
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
    },
    button: {
        backgroundColor: "#007bff", 
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: "#fff", 
        fontSize: 16,
        fontWeight: "bold",
    },
});
