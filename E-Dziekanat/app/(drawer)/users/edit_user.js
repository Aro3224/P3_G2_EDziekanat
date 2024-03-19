import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { get, child, ref, update } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';

export default function EditUserPage() {
    const route = useRoute();
    const userId = route.params?.id;
    const path = 'users/'+ userId;
    const [userData, setUserData] = useState(null);
    const [textNameValue, setTextNameValue] = useState("");
    const [textSurnameValue, setTextSurnameValue] = useState("");
    const [textEmailValue, setTextEmailValue] = useState("");
    const [textPhoneValue, setTextPhoneValue] = useState("");
    const [loading, setLoading] = useState(true);

    const ReadData = async () => {
        try {
            const snapshot = await get(child(ref(db), path));
            if (snapshot.exists()) {
                const userData = snapshot.val();
                setUserData(userData);
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

    useEffect(() => {
        ReadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    const EditData= () => {
        // Saving text in the database
        update(ref(db, path), {
          Imie: textNameValue
        }).then(() => {
          // Data saved successfully!
          console.log('Name updated')
        })
          .catch((error) => {
            // Write failed...
            alert(error);
          });

        update(ref(db, path), {
            Nazwisko: textSurnameValue
          }).then(() => {
            // Data saved successfully!
            console.log('Surname updated')
          })
            .catch((error) => {
              // Write failed...
              alert(error);
            });

          update(ref(db, path), {
            NrTelefonu: textPhoneValue
          }).then(() => {
            // Data saved successfully!
            console.log('Phone number updated')
          })
            .catch((error) => {
              // Write failed...
              alert(error);
            });
        alert("Dane zostały zaaktualizowane")
      };

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
            <TouchableOpacity style={styles.button} onPress={EditData}>
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
