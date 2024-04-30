import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link, Redirect } from 'expo-router';
import { db, auth } from '../../../components/configs/firebase-config';
import { getDatabase, onValue, ref, set, remove, update, get } from "firebase/database";

export default function TemplatesPage() {

  const [templates, setTemplates] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(null);

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
    <View style={styles.container}>
      <Drawer.Screen 
        options={{ 
          title:"Szablony", 
          headerShown: true, 
          headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text style={styles.title}>Szablony</Text>
      <Link href="/(drawer)/templates/add_template" asChild style={styles.button}>
        <Pressable>
          <Text style={styles.buttonText}>Dodaj szablon</Text>
        </Pressable>
      </Link>
      <View style={styles.templatesContainer}>
        {templates.map(template => (
          <TouchableOpacity
            key={template.id}
            onPress={() => handleSetTemplateInUse(template.id)}
            style={[
              styles.templateItem,
              template.inUse && styles.selectedTemplateItem
            ]}
            onMouseEnter={() => setShowDeleteButton(template.id)}
            onMouseLeave={() => setShowDeleteButton(null)}
          >
            <Text style={styles.templateTitle}>{template.title}</Text>
            <ScrollView style={{ maxHeight: 100 }}> 
              <Text style={styles.templateContent}>{template.content}</Text>
            </ScrollView>
            {!template.inUse && showDeleteButton === template.id && (
              <View style={styles.deleteButtonContainer}>
                <TouchableOpacity onPress={() => Platform.OS == "web" ? handleDeleteTemplateWeb(template.id) : handleDeleteTemplate(template.id)}>
                  <Text style={styles.deleteButtonText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  templatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  templateItem: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '45%', 
    height: 110, 
  },
  selectedTemplateItem: {
    backgroundColor: '#aaf',
  },
  templateTitle: {
    fontWeight: 'bold',
  },
  templateContent: {
    marginTop: 5,
  },
  deleteButton: {
    color: 'red',
    marginTop: 5,
  },
  deleteButtonContainer: {
    alignSelf: 'flex-start', // Align to the start of the parent container
  },
  deleteButtonText: {
    color: 'red',
    marginTop: 5,
  },
  
});
