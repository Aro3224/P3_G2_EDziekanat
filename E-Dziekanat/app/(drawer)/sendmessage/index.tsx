import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db, auth } from '../../../components/configs/firebase-config';
import axios from 'axios';

interface Template {
  id: string;
  content: string;
  title: string;
  inUse: boolean;
}

interface Group {
  id: string;
  members: string[];
}

export default function SendMessagePage() {
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);

  const [userToken, setUserToken] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
        setUserToken(idToken);
      }).catch(function (error) {
        console.error('Błąd podczas pobierania tokenu:', error);
      });
    }
    fetchUserRole();
    fetchGroups();
  }, []);

  useEffect(() => {
    // Load users from Firebase
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.keys(usersData).map((key) => ({
          id: key,
          name: usersData[key].name,
          email: usersData[key].email,
        }));
        setUsers(usersArray);
      }
    });

    // Load templates from Firebase
    const templatesRef = ref(db, 'templates');
    onValue(templatesRef, (snapshot) => {
      const templatesData = snapshot.val();
      if (templatesData) {
        const templatesArray = Object.keys(templatesData).map((key) => ({
          id: key,
          content: templatesData[key].content,
          title: templatesData[key].title,
          inUse: templatesData[key].inUse || false,
        }));
        setTemplates(templatesArray);

        const selected = templatesArray.find((template) => template.inUse);
        setSelectedTemplate(selected || null);
        if (selected) {
          setMessage(selected.content);
          setMessageTitle(selected.title);
        }
      }
    });
  }, []);

  const toggleUserSelection = (userId: string) => {
    const updatedSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter((id) => id !== userId)
      : [...selectedUsers, userId];
    setSelectedUsers(updatedSelectedUsers);
  };

  const selectTemplate = (template: Template | null) => {
    setSelectedTemplate(template);
    if (template) {
      setMessage(template.content);
      setMessageTitle(template.title);
    } else {
      setMessage('');
      if (selectedTemplate !== null) {
        setMessageTitle('');
      }
    }
  };

  const sendMessage = async (userToken: string) => {
    console.log('Message sent:', message);
    console.log('To:', selectedUsers);
    console.log('Template:', selectedTemplate);
    console.log('Title:', messageTitle);

    if (!selectedTemplate) {
      setMessage('');
      setMessageTitle('');
    }
    setSelectedUsers([]);
    try {
      for (const userId of selectedUsers) {
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        if (userData && userData.webtoken) {
          //Send push notification using Firebase
          const response = await axios.post('http://localhost:8000/api/send-push-notification/', {
            registrationToken: userData.webtoken,
            title: selectedTemplate?.title || messageTitle,
            message: message,
            UID: userId,
          }, {
            headers: {
              'Authorization': 'Bearer ' + userToken
            }
          });
          console.log(response.data);
        }
        if (userData && userData.SendSMS == true) {
          // Send SMS as a fallback
          const response = await axios.post('http://localhost:8000/api/send-sms/', {
            UID: userId,
            body: message,
          }, {
            headers: {
              'Authorization': 'Bearer ' + userToken
            }
          });
          console.log(response.data);
        }
        else if (userData && userData.mobtoken) {
          //Send push notification using Firebase
          const response = await axios.post('http://localhost:8000/api/send-push-notification/', {
            registrationToken: userData.mobtoken,
            title: selectedTemplate?.title || messageTitle,
            message: message,
            UID: userId,
          }, {
            headers: {
              'Authorization': 'Bearer ' + userToken
            }
          });
          console.log(response.data);
        }
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      alert("Błąd podczas wysyłania wiadomości");
    }
  };

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
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
      } else {
        console.error('User nie jest zalogowany');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const groupsRef = ref(db, 'groups');
      const snapshot = await get(groupsRef);
      const groupsData = snapshot.val();
      if (groupsData) {
        const groupsArray = Object.keys(groupsData).map(async (groupName) => {
          const group = groupsData[groupName];
          const groupUsersRef = ref(db, `groups/${groupName}/Users`);
          const groupUsersSnapshot = await get(groupUsersRef);
          const groupUsersData = groupUsersSnapshot.val();
          const members = group.members && group.members.map((member: { id: string }) => member.id); // Dodaj warunek
          return {
            id: groupName,
            members: members || [], // Domyślnie ustaw pustą tablicę, jeśli group.members jest undefined
          };
        });
        const resolvedGroupsArray = await Promise.all(groupsArray);
        setGroups(resolvedGroupsArray);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania grup:', error);
    }
  };

  const selectGroup = async (group: Group) => {
    try {
      const groupRef = ref(db, `groups/${group.id}/Users`);
      const groupSnapshot = await get(groupRef);
      const groupData = groupSnapshot.val();
  
      if (groupData) {
        const groupUserIds: string[] = Object.values(groupData); // Pobierz identyfikatory użytkowników z danych grupy
        console.log('Identyfikatory użytkowników z grupy:', groupUserIds);
        
        // Ustaw identyfikatory użytkowników jako wybrane
        setSelectedUsers(groupUserIds);
      } else {
        console.error('Dane grupy nie zostały pobrane poprawnie.');
      }
    } catch (error) {
      console.error('Błąd podczas zaznaczania użytkowników z grupy:', error);
    }
  };
  
  
  if (redirect) {
    const link = document.createElement('a');
    link.href = "/(drawer)/home";
    link.click();
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <Drawer.Screen
          options={{
            title: "Wyślij wiadomość",
            headerShown: true,
            headerLeft: () => <DrawerToggleButton />
          }} />
        <Text style={styles.subtitle}>Wyślij wiadomość</Text>

        <View style={styles.upperPanelContainer}>
          {/* Panel wyboru użytkownika */}
          <View style={styles.upperPanel}>
            <Text style={styles.sectionTitle}>Wybierz użytkowników:</Text>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userOption,
                  selectedUsers.includes(user.id) && styles.selectedUserOption,
                ]}
                onPress={() => toggleUserSelection(user.id)}
              >
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Panel wyboru grup */}
          <View style={styles.upperPanel}>
            <Text style={styles.sectionTitle}>Wybierz grupy:</Text>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupOption,
                ]}
                onPress={() => selectGroup(group)} // Dodaj funkcję obsługującą kliknięcie
              >
                <Text>{group.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Panel wyboru szablonu wiadomości */}
          <View style={styles.upperPanel}>
            <Text style={styles.sectionTitle}>Wybierz szablon wiadomości:</Text>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateOption,
                  selectedTemplate && selectedTemplate.id === template.id && styles.selectedTemplateOption,
                ]}
                onPress={() => selectTemplate(template)}
              >
                <Text>{template.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.templateOption,
                !selectedTemplate && styles.selectedTemplateOption,
              ]}
              onPress={() => selectTemplate(null)}
            >
              <Text>Pusty</Text>
            </TouchableOpacity>
          </View>
          {/* Panel wprowadzania tytułu wiadomości */}
          <View style={styles.upperPanel}>
            <TextInput
              style={styles.input}
              placeholder="Temat"
              value={messageTitle}
              onChangeText={setMessageTitle}
              editable={selectedTemplate === null}
            />
          </View>
        </View>

        {/* Panel dolny (do wpisywania treści wiadomości) */}
        <View style={styles.lowerPanel}>
          <TextInput
            style={styles.messageInput}
            placeholder="Treść wiadomości..."
            multiline
            value={message}
            onChangeText={setMessage}
            editable={selectedTemplate === null}
          />
          <TouchableOpacity style={styles.button} onPress={() => sendMessage(userToken)}>
            <Text style={styles.buttonText}>Wyślij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 36,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  upperPanelContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  upperPanel: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
  },
  userOption: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedUserOption: {
    backgroundColor: '#007bff',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  templateOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedTemplateOption: {
    backgroundColor: '#007bff',
  },
  groupOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
  },
  lowerPanel: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  messageInput: {
    width: '100%',
    height: 120,
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
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export { };
