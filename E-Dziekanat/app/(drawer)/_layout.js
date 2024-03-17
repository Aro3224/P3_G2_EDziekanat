import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons'

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer  screenOptions={{headerShown:false, swipeEdgeWidth:0 }}>
        <Drawer.Screen name='home'
        options={{
            drawerLabel: "Strona główna",
            title: "Strona główna",
            drawerIcon: ({size, color}) => <Ionicons name="home"  size={size} color={color}/>
        }}>
        </Drawer.Screen>

        <Drawer.Screen name='history'
        options={{
            drawerLabel: "Historia powiadomień",
            title: "Historia powiadomień",
            drawerIcon: ({size, color}) => <Ionicons name="reader-outline"  size={size} color={color}/>
        }}>
        </Drawer.Screen>

        <Drawer.Screen name='settings'
        options={{
            drawerLabel: "Ustawienia",
            title: "Ustawienia",
            drawerIcon: ({size, color}) => <Ionicons name="settings"  size={size} color={color}/>
        }}>
        </Drawer.Screen>
      </Drawer>
    </GestureHandlerRootView>
  );
}
