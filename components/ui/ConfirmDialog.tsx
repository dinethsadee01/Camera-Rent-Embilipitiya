import { Alert } from 'react-native';

export function confirmDelete(
  itemName: string,
  onConfirm: () => void
) {
  Alert.alert(
    'Delete ' + itemName,
    'This action cannot be undone. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]
  );
}

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void
) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
