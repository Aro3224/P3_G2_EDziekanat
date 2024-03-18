import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { app } from '../components/configs/firebase-config';

export default function Page() {

  return <Redirect href={"/(drawer)/home"}/>;
}
