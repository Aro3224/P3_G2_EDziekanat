import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity,FlatList } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get, onValue, set } from 'firebase/database';
import { db } from '../../../components/configs/firebase-config';
import { MaterialIcons } from '@expo/vector-icons';


export default function EditButtonPage() {
    const route = useRoute();
    const buttonId = route.params?.id;
    const path = 'buttons/'+ buttonId;
    const [userID, setUserID] = useState("");
    const [loading, setLoading] = useState(true);
    const [userEmails, setUserEmails] = useState([]);
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedGroup, setSelectedGroup] = useState("")
    const [groups, setGroups] = useState([]);


    useEffect(() => {

        const readData = async () => {
            try {
                const snapshot = await get(ref(db, path));
                if (snapshot.exists()) {
                    const buttonData = snapshot.val();
                    setUserID(buttonData?.userID || '');
                } else {
                    alert("Przycisk nie istnieje");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        readData();

        const fetchData = async () => {
            try {
                const usersRef = ref(db, 'users');
                onValue(usersRef, (snapshot) => {
                    const users = [];
                    snapshot.forEach((childSnapshot) => {
                        const userId = childSnapshot.key;
                        const email = childSnapshot.val().email;
                        users.push({ id: userId, email });
                    });
                    setUserEmails(users);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };
        fetchData();

        const fetchGroups = async () => {
            try {
                const groupsRef = ref(db, 'groups');
                const snapshot = await get(groupsRef);
                if (snapshot.exists()) {
                    const groupsData = [];
                    snapshot.forEach((childSnapshot) => {
                        const groupId = childSnapshot.key;
                        const groupData = childSnapshot.val();
                        groupsData.push({ id: groupId, ...groupData });
                    });
                    setGroups(groupsData);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();

    }, []);



    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    const selectUser = (itemID) => {
        setSelectedGroup("")
        setSelectedUser(itemID);
        console.log(itemID)
    }
    const selectGroup = (itemID) => {
        setSelectedUser("");
        setSelectedGroup(itemID)
        console.log(itemID)
    }


    const editButton = async () => {
        try {      
            const editButtonRef = ref(db, `/buttons/${buttonId}`);
            await set(editButtonRef, {userID: selectedUser==="" ? selectedGroup : selectedUser, type:selectedUser==="" ? 'group' : 'user'});
      
            console.log('Przycisk został dodany do bazy danych.');
            alert('Użytkownik został przypisany do przycisku');
          } catch (error) {
            console.error('Błąd podczas dodawania przycisku:', error);
            alert('Wystąpił błąd podczas dodawania przycisku. Spróbuj ponownie później.');
          }
    }

    
    return (
        <View style={styles.container}>
             <Drawer.Screen 
                options={{ 
                    title:"Edytuj przycisk", 
                    headerShown: true, 
                }}
            />
            <Text style={styles.title}>Edytuj Przycisk {buttonId}</Text>
            <View style={styles.listContainer}>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Użytkownicy</Text>
                    <FlatList
                        data={userEmails}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => selectUser(item.id)}>
                                <Text style={[styles.item, item.id === selectedUser ? styles.selectedItem : null]}>{item.email}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>Grupy</Text>
                    <FlatList
                        data={groups}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => selectGroup(item.id)}>
                                <Text style={[styles.item, item.id === selectedGroup ? styles.selectedItem : null]}>{item.id}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={editButton}>
                <Text style={styles.buttonText}>Zapisz</Text>
                <MaterialIcons name="save" size={24} color="white" />
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    section: {
        width: '48%',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        fontSize: 16,
        marginBottom: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    selectedItem: {
        backgroundColor: 'lightblue',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#007bff", 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff", 
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
    },
});