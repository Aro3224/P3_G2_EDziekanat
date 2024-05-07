import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { onValue, ref, remove, update, get } from "firebase/database";
import { PageTitle, StyledButton, ButtonText } from '../../../components/styles';

export default function TemplatesPage() {

  const [templates, setTemplates] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const templatesRef = ref(db,'/templates');
      onValue(templatesRef, (snapshot) => {
        const templatesData = snapshot.val();
        if (templatesData) {
          const templatesArray = Object.keys(templatesData).map(key => ({
            id: key,
            ...templatesData[key]
          }));
          setTemplates(templatesArray);
        }
      });
      fetchUserRole();
  }, []);


  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć ten szablon?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          onPress: async () => {
            try {
              await remove(ref(db, `/templates/${templateId}`));
              setSelectedTemplate(null);
              console.log('Szablon został usunięty z bazy danych.');
            } catch (error) {
              console.error('Błąd podczas usuwania szablonu:', error);
              Alert.alert('Błąd', 'Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteTemplateWeb = (templateId) => {
    const confirmation = window.confirm('Czy na pewno chcesz usunąć ten szablon?');
    
    if (confirmation) {
      try {
        remove(ref(db, `/templates/${templateId}`))
          .then(() => {
            setSelectedTemplate(null);
            console.log('Szablon został usunięty z bazy danych.');
          })
          .catch((error) => {
            console.error('Błąd podczas usuwania szablonu:', error);
            alert('Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
          });
      } catch (error) {
        console.error('Błąd podczas usuwania szablonu:', error);
        alert('Wystąpił błąd podczas usuwania szablonu. Spróbuj ponownie później.');
      }
    }
  };
  
  const handleSetTemplateInUse = (templateId) => {
    setSelectedTemplate(templateId);
    const updatedTemplates = templates.map(template => ({
      ...template,
      inUse: template.id === templateId
    }));

    const updates = {};
    updatedTemplates.forEach(template => {
      updates[`/templates/${template.id}/inUse`] = template.inUse;
    });

    try {
      update(ref(db), updates);
      setTemplates(updatedTemplates);
      console.log('Szablon został ustawiony jako używany.');
    } catch (error) {
      console.error('Błąd podczas ustawiania szablonu jako używanego:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas ustawiania szablonu jako używanego. Spróbuj ponownie później.');
    }
  };

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
          title:"Szablony", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <PageTitle>Szablony</PageTitle>
      <Link href="/(drawer)/templates/add_template" asChild style={styles.button}>
        <Pressable>
          <Text style={styles.buttonText}>Dodaj szablon</Text>
        </Pressable>
      </Link>
      <View style={styles.upperPanel}>
        <Text style={styles.sectionTitle}>Wybierz szablon:</Text>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateItem,
              selectedTemplate === template.id && styles.selectedTemplateItem
            ]}
            onPress={() => handleSetTemplateInUse(template.id)}
          >
            <Text style={[styles.templateTitle, selectedTemplate === template.id && styles.selectedText]}>{template.title}</Text>
            <View>
            <ScrollView style={{ maxHeight: 100, maxWidth: 400 }}> 
              <Text style={[selectedTemplate === template.id && styles.selectedText]}>{template.content}</Text>
            </ScrollView>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        {selectedTemplate && (
          <StyledButton onPress={() => Platform.OS == "web" ? handleDeleteTemplateWeb(selectedTemplate) : handleDeleteTemplate(selectedTemplate)}>
            <ButtonText>Usuń</ButtonText>
          </StyledButton>
        )}
      </View>
    </View>
    </ScrollView>
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
  scrollViewContainer: {
    flexGrow: 1,
  },
  upperPanel: {
    width: '80%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  templateItem: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  selectedTemplateItem: {
    backgroundColor: '#6D28D9',
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
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
  buttonContainer: {
    flexDirection: 'row',
    width: '83%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'center'
  },
});
