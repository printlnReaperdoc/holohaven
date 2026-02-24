import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { StatusBar } from "expo-status-bar";
import * as Notifications from 'expo-notifications';
import store from "./src/redux/store";
import RootNavigator, { navigationRef } from "./src/navigation/RootNavigator";
import { initializeSQLite } from "./src/utils/sqliteDb";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "./src/notifications/notificationUtils";
import { registerPushToken, fetchNotifications } from "./src/redux/slices/notificationsSlice";

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
      console.log('[ACTION] Notification received in app:', notification.request.content);
      // Refresh notification list when a new notification arrives
      dispatch(fetchNotifications());
    });

    // Handle notification tap → navigate to relevant screen
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[ACTION] Notification tapped, data:', data);

        const nav = navigationRef.current;
        if (!nav) return;

        if (data?.type === 'order' && data?.orderId) {
          console.log(`[ACTION] Navigating to order: ${data.orderId}`);
          nav.navigate('MainApp', {
            screen: 'OrdersDrawer',
            params: {
              screen: 'OrderDetail',
              params: { orderId: data.orderId },
            },
          });
        } else if (data?.type === 'promotion' && data?.productId) {
          console.log(`[ACTION] Navigating to product: ${data.productId}`);
          nav.navigate('MainApp', {
            screen: 'HomeDrawer',
            params: {
              screen: 'ProductDetail',
              params: { productId: data.productId },
            },
          });
        } else {
          // Default: open notifications screen
          nav.navigate('MainApp', { screen: 'NotificationsDrawer' });
        }
      }
    );

    return () => {
      unsubscribe();
      responseSubscription.remove();
    };
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


