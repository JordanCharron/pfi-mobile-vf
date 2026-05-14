import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import t from '../i18n';

export default function AdminNavBar({ actif }) {
  const items = [
    { cle: 'produits',    label: t('produits'),     icone: 'cube',     route: '/admin' },
    { cle: 'users',       label: t('utilisateurs'), icone: 'users',    route: '/admin/users' },
    { cle: 'commandes',   label: t('commandes'),    icone: 'list-alt', route: '/admin/commandes' },
    { cle: 'entrepots',   label: t('entrepotsTitre'), icone: 'building', route: '/admin/entrepots' },
    { cle: 'compte',      label: t('compte'),       icone: 'user',     route: '/compte' },
  ];

  return (
    <View style={styles.nav}>
      {items.map(item => {
        const estActif = actif === item.cle;
        return (
          <TouchableOpacity
            key={item.cle}
            style={styles.btn}
            onPress={() => router.replace(item.route)}
          >
            <FontAwesome name={item.icone} size={22} color={estActif ? 'black' : 'darkgray'} />
            <Text style={[styles.label, estActif && styles.actif]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'gainsboro', backgroundColor: 'white', paddingVertical: 10, paddingBottom: 20 },
  btn:   { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 11, color: 'darkgray' },
  actif: { color: 'black', fontWeight: '700' },
});
