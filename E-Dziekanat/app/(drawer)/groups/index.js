import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';
import { useNavigation } from '@react-navigation/native';


export default function GroupPage() {
  const navigateToCreateGroup = () => {
    navigation.navigate('(drawer)/groups/creategroup');
  };
  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Grupy", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text style={styles.subtitle}>Grupy</Text>
      <TouchableOpacity style={styles.button} onPress={navigateToCreateGroup}>
            <Text style={styles.buttonText}>Stwórz grupę</Text>
          </TouchableOpacity>
          <Link href={"/(drawer)/groups/creategroup"}>
        <Text>Przejdź do podstrony</Text>
      </Link>
    </View>);
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
    marginBottom: 10,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '30%'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
  },
})