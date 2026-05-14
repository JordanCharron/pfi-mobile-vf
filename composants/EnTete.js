import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getUtilisateur, deconnecter } from '../utils/session';
import confirmer from '../utils/confirmer';
import t from '../i18n';


export default function EnTete({ titre }) {
  const user = getUtilisateur();

  function seDeconnecter() {
    confirmer(t('deconnexion'), (user && user.nom) + ' ?', () => {
      deconnecter();
      router.replace('/');
    });
  }

  return (
    <View style={styles.entete}>
      <Text style={styles.titre} numberOfLines={1}>{titre}</Text>
      {user ? (
        <View style={styles.droite}>
          <Text style={styles.user}>{user.nom} · {user.langue_prefere}</Text>
          <TouchableOpacity style={styles.btnDeco} onPress={seDeconnecter}>
            <FontAwesome name="sign-out" size={18} color="gray" />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'whitesmoke',
  },
  titre:  { fontSize: 22, fontWeight: '800', color: 'black', flex: 1 },
  droite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  user:   { fontSize: 12, color: 'gray', fontWeight: '600' },
  btnDeco:{ padding: 4 },
});
