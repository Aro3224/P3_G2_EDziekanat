import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { db, auth } from '../../../components/configs/firebase-config';
import { ref, set, push, get } from "firebase/database";
import { MsgBox, StyledButton, ButtonText, StyledTextInput, PageTitle, StyledInputLabel } from '../../../components/styles';



export default function AddTemplatePage() {
  const [templateTitle, onChangeTitle] = useState('');
  const [templateContent, onChangeContent] = useState('');
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const validateTitle = (title) => {
    return title.length > 0;
  };

  const validateContent = (content) => {
    return content.length > 0;
  };

  const addTemplate = () => {
    setMessage('');

    if (!validateTitle(templateTitle)) {
      setMessage('Tytuł nie może być pusty.');
      return;
    }

    if (!validateContent(templateContent)) {
      setMessage('Treść powiadomienia nie może być pusta.');
      return;
    }


      
    const templateRef = ref(db, '/templates');
    const newTemplateRef = push(templateRef);
  
    set(newTemplateRef, {
      title: templateTitle,
      content: templateContent,
      inUse: false,
    })
      .then(() => {
        console.log('Szablon został dodany');
      onChangeTitle("");
      onChangeContent("");
      Alert.alert("Dodano szablon","Szablon został dodany do systemu")
      alert("Szablon został dodany do systemu")
      })

      

  }

  useEffect(() => {
    fetchUserRole();
  }, []);


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

  if (redirect) {
    const link = document.createElement('a');
    link.href = "/(drawer)/home";
    link.click();
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Dodaj szablon", 
        headerShown: true, 
        }}/>
        <PageTitle>Dodaj szablon</PageTitle>
          <StyledInputLabel>Tytuł szablonu</StyledInputLabel>
          <StyledTextInput 
            style={styles.input}
            onChangeText={onChangeTitle}
            value={templateTitle}
            placeholder='Tytuł'
          />
          <StyledInputLabel>Treść</StyledInputLabel>
          <StyledTextInput 
            style={styles.input}
            onChangeText={onChangeContent}
            value={templateContent}
            placeholder="Treść powiadomienia"
          />
      <StyledButton onPress={addTemplate}>
        <ButtonText>Dodaj</ButtonText>
      </StyledButton>
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
  errorMessage: {
    color: 'red',
    fontSize: 18,
},
inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},
input: {
  width: '50%',
  borderWidth: 1,
  borderColor: '#ccc',
  paddingHorizontal: 10,
  marginBottom: 20,
},
inputLocked: {
  borderColor: 'orange'
},
});
