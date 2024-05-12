import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Platform, TouchableOpacity, View, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ref, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db, auth } from '../../../components/configs/firebase-config';
import axios from 'axios';
import { StyledButton, ButtonText, MsgBox, PageTitle, StyledInputLabel, StyledTextInput } from '../../../components/styles';

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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [userToken, setUserToken] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
  }, []);

  useEffect(() => {
    // Load users from Firebase
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.keys(usersData).map((key) => ({
          id: key,
          name: usersData[key].Imie,
          surname: usersData[key].Nazwisko,
          email: usersData[key].email,
        }));
        setUsers(usersArray);
      }
    });

    const groupsRef = ref(db, '/groups');
    onValue(groupsRef, async (snapshot) => {
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

  if(selectedUsers == null){
    setSelectedGroup == null;
  }
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

    if(selectedUsers.length === 0){
      setErrorMessage("Wybierz komu chcesz wysłać wiadomość.")
    }

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
          setErrorMessage("")
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
          setErrorMessage("")
        }
        if (userData && userData.webtoken) {
          //Send push notification using Firebase
          const response = await axios.post('http://localhost:8000/api/send-web-notification/', {
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
          setErrorMessage("")
        }
      }
      alert("Wiadomość została wysłana");
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      alert("Błąd podczas wysyłania wiadomości");
      setErrorMessage("Błąd podczas wysyłania wiadomości")
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

  const selectGroup = async (group: Group) => {
    try {
      if (selectedGroup === group.id) {
        setSelectedGroup(null);
        setSelectedUsers([]);
      } else {
        const groupRef = ref(db, `groups/${group.id}/Users`);
        const groupSnapshot = await get(groupRef);
        const groupData = groupSnapshot.val();
    
        if (groupData) {
          const groupUserIds: string[] = Object.values(groupData);
          console.log('Identyfikatory użytkowników z grupy:', groupUserIds);
          
          setSelectedUsers(groupUserIds);
          setSelectedGroup(group.id);
        } else {
          console.error('Dane grupy nie zostały pobrane poprawnie.');
        }
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
        <PageTitle>Wyślij wiadomość</PageTitle>

        <View style={Platform.OS === "web" ? styles.panelContainer : styles.panelContainerOS}>
          {/* Panel wyboru użytkownika */}
          <View style={styles.upperPanel}>
            <Text style={styles.sectionTitle}>Wybierz użytkowników:</Text>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userOption,
                  selectedUsers.includes(user.id) && styles.selectedOption,
                ]}
                onPress={() => toggleUserSelection(user.id)}
              >
                {Platform.OS !== 'web' ? (
                <Text style={[styles.userName, selectedUsers.includes(user.id) && styles.selectedText]}>{user.name} {user.surname}</Text>
              ) : (
                <>
                  <Text style={[styles.userName, selectedUsers.includes(user.id) && styles.selectedText]}>{user.name} {user.surname}</Text>
                  <Text style={[styles.userEmail, selectedUsers.includes(user.id) && styles.selectedText]}>{user.email}</Text>
                </>
              )}
              </TouchableOpacity>
            ))}
          </View>
          {/* Panel wyboru grup */}
          <View style={styles.upperPanel}>
            <Text style={styles.sectionTitle}>Wybierz grupę:</Text>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupOption,
                  selectedGroup === group.id && styles.selectedOption
                ]}
                onPress={() => selectGroup(group)}
              >
                <Text style={[styles.groupID, selectedGroup === group.id && styles.selectedText]}>{group.id}</Text>
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
                  selectedTemplate && selectedTemplate.id === template.id && styles.selectedOption,
                ]}
                onPress={() => selectTemplate(template)}
              >
                <Text style={[styles.groupID, selectedTemplate && selectedTemplate.id === template.id && styles.selectedText]}>{template.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.templateOption,
                !selectedTemplate && styles.selectedOption,
              ]}
              onPress={() => selectTemplate(null)}
            >
              <Text style={[styles.groupID, !selectedTemplate && styles.selectedText]}>Pusty</Text>
            </TouchableOpacity>
          </View>
          
        </View>

        {/* Panel dolny (do wpisywania treści wiadomości) */}
        <View style={Platform.OS === "web" ? styles.panelContainer : styles.panelContainerOS}>
        <View style={styles.lowerPanel}>
          {/* Panel wprowadzania tytułu wiadomości */}
          <StyledInputLabel style={{marginVertical: 10}}>Temat</StyledInputLabel>
          <StyledTextInput
            style={styles.input}
            placeholder="Temat"
            value={messageTitle}
            onChangeText={setMessageTitle}
            editable={selectedTemplate === null}
          />
        <StyledInputLabel style={{marginBottom: 10}}>Treść</StyledInputLabel>
        <StyledTextInput
          style={styles.messageInput}
          placeholder="Treść wiadomości..."
          multiline
          value={message}
          onChangeText={setMessage}
          editable={selectedTemplate === null}
        />
          </View>
          <StyledButton style={{width: '100%'}} onPress={() => sendMessage(userToken)}>
            <ButtonText>Wyślij</ButtonText>
          </StyledButton>
          <MsgBox style={styles.errorMessage}>{errorMessage}</MsgBox>
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
  panelContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  panelContainerOS: {
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
    marginTop: 30,
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
  selectedOption: {
    backgroundColor: '#6D28D9',
  },
  selectedText: {
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
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
  templateOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
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
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  messageInput: {
    height: 120,
    borderColor: '#ccc',
  },
  errorMessage: {
    color: 'red',
    fontSize: 18,
  },
});

export { };
