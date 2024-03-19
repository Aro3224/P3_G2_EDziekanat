import { Text, View, StyleSheet, Pressable, } from 'react-native';
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
          <Link href="/(drawer)/groups/creategroup" asChild style={styles.button}>
          <Pressable>
            <Text style={styles.buttonText}>Utwórz grupę</Text>
          </Pressable>
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
    backgroundColor: "#007bff", 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '20%'
  },
  buttonText: {
    color: "#fff", 
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center'
  },
})