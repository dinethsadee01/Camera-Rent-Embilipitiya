import { Alert } from 'react-native';

export const Toast = {
  success: (message: string) => Alert.alert('✓ Success', message),
  error: (message: string) => Alert.alert('Error', message),
};
