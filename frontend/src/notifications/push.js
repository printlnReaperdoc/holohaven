import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { axiosInstance } from '../api/api';
import { getToken } from '../auth/token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPush = async () => {
  if (!Device.isDevice) return null;

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save token to backend
    if (token) {
      await axiosInstance.post(
        '/users/push-token',
        { token }
      );
    }

    return token;
  } catch (error) {
    console.log('Error registering for push notifications:', error);
    return null;
  }
};

export const handleNotificationResponse = (response) => {
  const { data } = response.notification;

  if (data.type === 'order') {
    // Handle order notification
    console.log('Order notification:', data.orderId);
  } else if (data.type === 'promotion') {
    // Handle promotion notification
    console.log('Promotion notification:', data.promotionId);
  }
};

