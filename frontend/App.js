import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { StatusBar } from "expo-status-bar";
import store from "./src/redux/store";
import RootNavigator from "./src/navigation/RootNavigator";
import { initializeSQLite } from "./src/utils/sqliteDb";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "./src/notifications/notificationUtils";
import { registerPushToken } from "./src/redux/slices/notificationsSlice";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize SQLite database on app launch
    initializeSQLite();

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log('Registering push token:', token);
        dispatch(registerPushToken(token));
      }
    });

    // Setup notification listeners
    const unsubscribe = setupNotificationListeners((notification) => {
      console.log('Notification received in app:', notification.request.content);
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}


