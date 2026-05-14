import { Alert, Platform } from 'react-native';

// affiche boite de confirmation
//sur certain browser ca ne fonctionne pas
export default function confirmer(titre, message, onConfirmer) {
  if (Platform.OS === 'web') {
    if (window.confirm(titre + '\n\n' + message)) onConfirmer();
    return;
  }
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Confirmer', style: 'destructive', onPress: onConfirmer },
  ]);
}
