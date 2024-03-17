import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Link } from 'expo-router';


export default function HomePage() {
  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Strona główna", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text>Strona główna</Text>
      <Text>Tutaj pojawią się nieprzeczytane powiadomienia</Text>
      <Link href={"/(drawer)/home/nextpage"}>
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
  }
})