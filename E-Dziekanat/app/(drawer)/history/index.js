import { Text, View, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function HistoryPage() {
  return (
    <View style={styles.container}>
      <Drawer.Screen 
      options={{ 
        title:"Historia powiadomień", 
        headerShown: true, 
        headerLeft: ()=> <DrawerToggleButton/>}} />
      <Text>Tu pojawi się lista otrzymanych powiadomień</Text>
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