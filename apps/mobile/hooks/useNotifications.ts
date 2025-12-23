import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { api } from '@/lib/api';
import { notifications } from '@/lib/notifications';

export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // Request permissions
      const granted = await notifications.requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        // Register for push notifications
        const token = await notifications.registerForPushNotifications();
        if (token) {
          setExpoPushToken(token);

          // Register token with backend
          await api.registerPushToken(
            token,
            Platform.OS as 'ios' | 'android'
          );
        }
      }

      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Handle notification interactions
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          console.log('Notification tapped:', data);
          // Handle deep linking based on notification data
        }
      );

      return () => {
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const requestPermissions = async () => {
    const granted = await notifications.requestPermissions();
    setPermissionGranted(granted);
    if (granted) {
      await setupNotifications();
    }
    return granted;
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Show immediately
    });
  };

  return {
    permissionGranted,
    expoPushToken,
    requestPermissions,
    scheduleLocalNotification,
  };
}
