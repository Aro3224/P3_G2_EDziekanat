import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { auth } from './configs/firebase-config';

const Timer = () => {
  const [logoutTime, setLogoutTime] = useState(Date.now() + (60 * 60 * 1000)); // Ustaw czas wylogowania na godzinę od teraz

  useEffect(() => {
    const logoutInterval = setInterval(() => {
      setLogoutTime(prevTime => prevTime - 1); // Odjęcie jednej sekundy od czasu wylogowania co sekundę
    }, 1000); // Sprawdzaj co sekundę

    return () => {
      clearInterval(logoutInterval); // Wyczyść interwał przed odmontowaniem komponentu
    };
  }, []);

  useEffect(() => {
    if (logoutTime <= Date.now()) {
        auth.signOut();
    }
  }, [logoutTime]);

  // Funkcja do formatowania czasu
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Text>{`Czas do wylogowania: ${formatTime(Math.max(0, Math.ceil((logoutTime - Date.now()) / 1000)))}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
    marginRight: 20,
  },
});

export default Timer;
