import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRoute } from '@react-navigation/native';
import { ref, get, onValue, set } from 'firebase/database';
import { db, auth } from '../../../components/configs/firebase-config';
import { StyledButton, ButtonText, PageTitle } from '../../../components/styles';

export default function EditButtonPage() {
    const route = useRoute();
    const buttonId = route.params?.id;
    const path = 'buttons/'+ buttonId;
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [groups, setGroups] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const readData = async () => {
            try {
                const snapshot = await get(ref(db, path));
                if (snapshot.exists()) {
                    const buttonData = snapshot.val();
                    setSelectedUser(buttonData?.userID || '');
                    setSelectedGroup(buttonData?.userID || '');
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

        const usersRef = ref(db, '/users');
        onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                const usersArray = Object.keys(usersData).map(key => ({
                    id: key,
                    ...usersData[key]
                }));
                setUsers(usersArray);
            }
        });

        const groupsRef = ref(db, '/groups');
        onValue(groupsRef, async (snapshot) => {
            const groupsData = snapshot.val();
            if (groupsData) {
                const groupsArray = await Promise.all(Object.keys(groupsData).map(async key => {
                    const users = groupsData[key].Users || [];
                    const usersDetails = await Promise.all(users.map(async userID => {
                        const userSnapshot = await get(ref(db, `users/${userID}`));
                        const userData = userSnapshot.val();
                        return `${userData?.Imie} ${userData?.Nazwisko}`;
                    }));
                    return {
                        id: key,
                        users: usersDetails
                    };
                }));
                setGroups(groupsArray);
            }
        });

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

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Trwa ładowanie danych...</Text>
            </View>
        );
    }

    const selectUser = (itemID) => {
        setSelectedGroup("");
        console.log(itemID)
        setSelectedUser(prevSelectedUser => (prevSelectedUser === itemID ? "" : itemID));
    }

    const selectGroup = (itemID) => {
        setSelectedUser("");
        console.log(itemID)
        setSelectedGroup(prevSelectedGroup => (prevSelectedGroup === itemID ? "" : itemID));
    }

    const editButton = async () => {
        try {      
            const editButtonRef = ref(db, `/buttons/${buttonId}`);
            await set(editButtonRef, {userID: selectedUser === "" ? selectedGroup : selectedUser, type: selectedUser === "" ? 'group' : 'user'});
      
            console.log('Przycisk został dodany do bazy danych.');
            if (selectedGroup === "" && selectedUser === "") {
                alert('Do przycisku nie jest przypisany żaden użytkownik');
            } else {
                alert('Użytkownik został przypisany do przycisku');
            }
        } catch (error) {
            console.error('Błąd podczas dodawania przycisku:', error);
            alert('Wystąpił błąd podczas dodawania przycisku. Spróbuj ponownie później.');
        }
    }

    if (redirect) {
        const link = document.createElement('a');
        link.href = "/(drawer)/home";
        link.click();
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
                <Drawer.Screen 
                    options={{ 
                        title:"Edytuj przycisk", 
                        headerShown: true, 
                    }}
                />
                <PageTitle>Edytuj Przycisk {buttonId}</PageTitle>
                <View style={styles.upperPanel}>
                    <Text style={styles.sectionTitle}>Wybierz użytkownika:</Text>
                    {users.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.item,
                                selectedUser === item.id && styles.selectedItem
                            ]}
                            onPress={() => selectUser(item.id)}
                        >
                            {Platform.OS !== 'web' ? (
                                <Text style={[styles.userName, selectedUser === item.id && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
                            ) : (
                                <>
                                    <Text style={[styles.userName, selectedUser === item.id && styles.selectedText]}>{item.Imie} {item.Nazwisko}</Text>
                                    <Text style={[styles.userEmail, selectedUser === item.id && styles.selectedText]}>{item.email}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.upperPanel}>
                    <Text style={styles.sectionTitle}>Wybierz grupę:</Text>
                    {groups.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.item,
                                selectedGroup === item.id && styles.selectedItem
                            ]}
                            onPress={() => selectGroup(item.id)}
                        >
                            {Platform.OS !== 'web' ? (
                                <Text style={[styles.groupID, selectedGroup === item.id && styles.selectedText]}>{item.id}</Text>
                            ) : (
                                <>
                                    <Text style={[styles.groupID, selectedGroup === item.id && styles.selectedText]}>{item.id}</Text>
                                    <Text style={[styles.groupMembers, selectedGroup === item.id && styles.selectedText]}>{item.users.length > 0 ? item.users.join(', ') : 'Brak członków'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
                <StyledButton onPress={editButton}>
                    <ButtonText>Zapisz</ButtonText>
                </StyledButton>
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
        paddingVertical: 20,
        paddingHorizontal: '15%',
    },
    containerOS: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    upperPanel: {
        width: '80%',
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 30,
    },
    item: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#dcdcdc',
        borderRadius: 5,
        marginBottom: 5,
    },
    selectedItem: {
        backgroundColor: '#6D28D9',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    groupID: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    groupMembers: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        marginLeft: 5,
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
    selectedText: {
        color: '#fff',
    },
});
