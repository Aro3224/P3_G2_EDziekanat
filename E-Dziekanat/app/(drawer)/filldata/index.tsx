import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, get } from "firebase/database";
import { auth, db } from '../../../components/configs/firebase-config'
import axios from 'axios';
import { MsgBox } from '../../../components/styles';


export default function FillDataPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPasswordValue, setTextPasswordValue] = useState("");
    const [textRepeatPasswordValue, setTextRepeatPasswordValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>("");


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
        if (textEmailValue != "" && textPasswordValue != "" && textNameValue != "" && textSurnameValue != "" && textPhoneValue != "")
        {
          if( textPasswordValue == textRepeatPasswordValue && textPasswordValue.length >= 6)
            {
              try {
                const response = await axios.post('http://localhost:8000/api/edit-user/', {
                    UID: userId,
                    email: textEmailValue,
                    password: textPasswordValue,
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
            } else {
              setMessage('Podane hasła nie są takie same lub hasło jest za krótkie')
            }
        }else{
          setMessage('Uzupełnij wszystkie pola')
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
                title:"Uzupełnij Dane", 
                headerShown: true, 
                headerLeft: ()=> <DrawerToggleButton/>}} />
            <Text style={styles.subtitle}>Uzupełnij swoje dane</Text>
            <TextInput
                style={styles.input}
                placeholder="Wpisz swój email"
                value={textEmailValue}
                onChangeText={setTextEmailValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Wprowadź nowe hasło (co najmniej 6 znaków)"
                value={textPasswordValue}
                onChangeText={setTextPasswordValue}
            />
            <TextInput
                style={styles.input}
                placeholder="Potwierdź hasło"
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
