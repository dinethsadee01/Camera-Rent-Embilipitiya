import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export const Toast = {
  success: (message: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✓ Success', message);
  },
  error: (message: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Error', message);
  },
};
