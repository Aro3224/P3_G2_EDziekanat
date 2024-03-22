import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { app } from '../components/configs/firebase-config';
import Login from '../components/screens/Login';

export default function Page() {

  //return <Redirect href={"/(drawer)/home"}/>;
  return <Login/>;
}
