import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { update, ref, get } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';
import axios from 'axios';

export default function EditUserPage() {
    const route = useRoute();
    const userId = route.params?.id;
    const path = 'users/'+ userId;
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [loading, setLoading] = useState(true);

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
        try {
            const response = await axios.post('http://localhost:8000/api/edit-user/', {
                UID: userId,
                email: textEmailValue,
                Imie: textNameValue,
                Nazwisko: textSurnameValue,
                NrTelefonu: textPhoneValue,
            });
            console.log(response.data);
            alert("Dane zostały zaaktualizowane");
        } catch (error) {
            console.error('Błąd podczas wysyłania żądania edycji użytkownika:', error);
            alert("Wystąpił błąd podczas aktualizacji danych");
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
            <Text style={styles.subtitle}>Edytuj Wykładowcę</Text>
            <TextInput
                style={styles.input}
                placeholder="Wpisz email wykładowcy.."
                value={textEmailValue}
                onChangeText={setTextEmailValue}
                editable={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz imię wykładowcy.."
                value={textNameValue}
                onChangeText={setTextNameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz nazwisko wykładowcy.."
                value={textSurnameValue}
                onChangeText={setTextSurnameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz numer telefonu..."
                value={textPhoneValue}
                onChangeText={setTextPhoneValue}
            />
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
});
