import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList, Platform, ScrollView, Pressable } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { auth, db } from '../../../components/configs/firebase-config';
import { ref, get } from "firebase/database";
import { PageTitle, StyledButton, ButtonText } from '../../../components/styles';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 20;

const fetchNotifications = async (isAdmin) => {
  try {
    const userId = auth.currentUser.uid;
    let notificationsData = [];

    if (isAdmin) {
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        const userIds = Object.keys(users);

        for (const uid of userIds) {
          const userNotificationsRef = ref(db, `notifications/${uid}`);
          const userNotificationsSnapshot = await get(userNotificationsRef);

          if (userNotificationsSnapshot.exists()) {
            const userNotifications = userNotificationsSnapshot.val();
            const notificationsWithUser = Object.entries(userNotifications).map(([notificationId, notification]) => ({
              id: notificationId,
              ...notification,
              userId: uid,
              userData: users[uid],
            }));
            notificationsData.push(...notificationsWithUser);
          }
        }
      }
    } else {
      const notificationsRef = ref(db, `notifications/${userId}/`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const fetchedNotificationsData = snapshot.val();
        const filteredNotifications = Object.entries(fetchedNotificationsData)
          .filter(([notificationId, notification]) => !notification.soft_deleted)
          .map(([notificationId, notification]) => ({
            id: notificationId,
            ...notification,
          }));
        notificationsData = filteredNotifications;
      }
    }

    return notificationsData.sort((a, b) => b.czas - a.czas);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export default function HistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortDescending, setSortDescending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const navigation = useNavigation();
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = auth.currentUser.uid;
        const roleRef = ref(db, `users/${userId}/Rola`);
        const roleSnapshot = await get(roleRef);

        setIsAdmin(roleSnapshot.exists() && roleSnapshot.val() === 'Pracownik');
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  const sortNotificationsByTime = (notificationsData, descending) => {
    return notificationsData.sort((a, b) => {
      if (descending) {
        return a.czas - b.czas;
      } else {
        return b.czas - a.czas;
      }
    });
  };
  
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notificationsData = await fetchNotifications(isAdmin);
      const sortedNotifications = sortNotificationsByTime(notificationsData, sortDescending);
      setAllNotifications(sortedNotifications);
      setNotifications(sortedNotifications.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, sortDescending]);
  

  useEffect(() => {
    loadNotifications();
  }, [isAdmin, loadNotifications]);

  const toggleSortOrder = () => {
    setSortDescending(prevState => !prevState);
    const sortedNotifications = sortNotificationsByTime(allNotifications, !sortDescending);
    setNotifications(sortedNotifications.slice(0, PAGE_SIZE));
  };
  

  const refreshNotifications = async () => {
    setCurrentPage(1);
    setNotifications([]);
    await loadNotifications();
  };

  const handlePageChange = (direction) => {
    const newPage = currentPage + direction;
    const start = (newPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageData = allNotifications.slice(start, end);
    setCurrentPage(newPage);
    setNotifications(pageData);
  
    if (newPage <= 1) {
      setPreviousButtonDisabled(true);
    } else {
      setPreviousButtonDisabled(false);
    }
  
    if ((newPage * PAGE_SIZE) >= allNotifications.length) {
      setNextButtonDisabled(true);
    } else {
      setNextButtonDisabled(false);
    }
  };
  

  const renderNotificationItem = ({ item }) => {
    const notificationDate = new Date(item.czas).toLocaleString();
    const notificationReadDate = item.czasOdczytania ? new Date(item.czasOdczytania).toLocaleString() : '';
    const isUnread = item.odczytano === false;
    const isNewResponse = isAdmin && item.nowaOdpowiedz === true;

    const navigateToDetails = () => {
      const params = { uid: item.userId, id: item.id };
      navigation.navigate('details', params);
    };

    return (
      <Pressable onPress={navigateToDetails}>
        <View style={[styles.notificationItem, isUnread && styles.unreadNotification, isNewResponse && styles.newResponseNotification]}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.tytul}</Text>
            {isAdmin && item.userData?.email && (
              <Text>{item.userData.Imie} {item.userData.Nazwisko}</Text>
            )}
          </View>
          <View style={styles.datesContainer}>
            <Text style={styles.notificationDate}>Otrzymano: {notificationDate}</Text>
            {notificationReadDate && (
              <Text style={styles.notificationDate}>Odczytano: {notificationReadDate}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
        <Drawer.Screen 
          options={{ 
            title: isAdmin ? "Wszystkie powiadomienia" : "Historia powiadomień", 
            headerShown: true, 
            headerLeft: () => <DrawerToggleButton />
          }} 
        />
        <PageTitle>Lista powiadomień</PageTitle>
        <View style={Platform.OS === "web" ? styles.buttonContainer : styles.buttonContainerOS}>
        <StyledButton onPress={toggleSortOrder}>
          <ButtonText>{sortDescending ? 'Od najnowszych' : 'Od najstarszych'}</ButtonText>
        </StyledButton>
          <StyledButton onPress={refreshNotifications}>
            <ButtonText>Odśwież</ButtonText>
          </StyledButton>
        </View>
        <View style={styles.upperPanel}>
          <Text style={styles.sectionTitle}>Powiadomienia:</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={loading && <Text>Ładowanie...</Text>}
          />
        </View>
        <View style={styles.paginationContainer}>
        <StyledButton onPress={() => handlePageChange(-1)} disabled={previousButtonDisabled} style={previousButtonDisabled ? styles.disabledButton : null}>
          <ButtonText>Poprzednia</ButtonText>
        </StyledButton>
        <Text style={styles.pageIndicator}>{currentPage}</Text>
        <StyledButton onPress={() => handlePageChange(1)} disabled={nextButtonDisabled} style={nextButtonDisabled ? styles.disabledButton : null}>
          <ButtonText>Następna</ButtonText>
        </StyledButton>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: '15%',
  },
  containerOS: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  upperPanel: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 30,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 14,
    color: '#666',
  },
  notificationItem: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  notificationContent: {
    marginBottom: 10,
  },
  unreadNotification: {
    backgroundColor: "#ffcccc",
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '93%',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'flex-end',
  },
  buttonContainerOS: {
    paddingHorizontal: 20,
    marginTop: 15,
    flexDirection: 'row',
  },
  datesContainer: {
    flexDirection: 'column',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  pageIndicator: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
