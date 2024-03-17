import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function SettingsPage() {
  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Ustawienia", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text>Tu pojawią się ustawienia aplikacji</Text>
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