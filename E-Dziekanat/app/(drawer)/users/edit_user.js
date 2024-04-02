import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';
import axios from 'axios';
import { Checkbox } from 'react-native-paper';

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
    const [checkedWykladowca, setCheckedWykladowca] = useState(false);
    const [checkedPracownik, setCheckedPracownik] = useState(false);
    const [textRoleValue, setTextRoleValue] = useState("");

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
                        setCheckedWykladowca(userData?.Rola || '');
                    }else if(userData?.Rola == "Pracownik"){
                        setCheckedPracownik(userData?.Rola || '');
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
    }, []);

    const editUser = async () => {
        if (textRoleValue != "")
        {
            try {
                const response = await axios.post('http://localhost:8000/api/edit-user/', {
                    UID: userId,
                    email: textEmailValue,
                    password: textPasswordValue,
                    Imie: textNameValue,
                    Nazwisko: textSurnameValue,
                    NrTelefonu: textPhoneValue,
                    Role: textRoleValue,
                });
                console.log(response.data);
                alert("Dane zostały zaaktualizowane");
            } catch (error) {
                console.error('Błąd podczas wysyłania żądania edycji użytkownika:', error);
                alert("Wystąpił błąd podczas aktualizacji danych");
            }
        }else{
            alert("Wybierz stanowisko pracownika");
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
            setPlaceHolderValue("Wprowadź nowe hasło");
        }
    };

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
                    title:"Edytuj użytkownika", 
                    headerShown: true, 
                }}
            />
            <Text style={styles.subtitle}>Edytuj Pracownika</Text>
            <TextInput
                style={styles.input}
                placeholder="Wpisz email użytkownika.."
                value={textEmailValue}
                onChangeText={setTextEmailValue}
            />
            <TextInput
                style={[styles.input, !isPasswordEditable && styles.inputLocked]}
                placeholder={placeHolderValue}
                value={textPasswordValue}
                onChangeText={setTextPasswordValue}
                editable={isPasswordEditable}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz imię użytkownika.."
                value={textNameValue}
                onChangeText={setTextNameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz nazwisko użytkownika.."
                value={textSurnameValue}
                onChangeText={setTextSurnameValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wpisz numer telefonu użytkownika..."
                value={textPhoneValue}
                onChangeText={setTextPhoneValue}
            />
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
            <TouchableOpacity style={styles.button} onPress={setPasswordEditable}>
                <Text style={styles.buttonText}>{isPasswordEditable ? 'Naciśnij aby anulować edycje hasła' : 'Naciśnij aby edytować hasło'}</Text>
            </TouchableOpacity>
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
});
