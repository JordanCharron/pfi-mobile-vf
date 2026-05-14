import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePanier } from './PanierContext';
import { getAbonnementActif } from '../db/database';
import { getUtilisateur } from '../utils/session';
import t from '../i18n';

export default function NavBar({ actif }) {
  const { compte } = usePanier();
  const [aPlan, setAPlan] = useState(false);
  const user = getUtilisateur();

  // recheck si user a un forfait quand on change de page
  useEffect(() => {
    if (!user) return setAPlan(false);
    getAbonnementActif(user.id)
      .then(abo => setAPlan(!!abo))
      .catch(e => console.warn('NavBar getAbonnementActif:', e));
  }, [actif]);

  // acceuil devien forfait si le user a un plan
  const onglet = aPlan
    ? { route: '/forfait', icone: 'file-text-o', label: t('monForfait') }
    : { route: '/accueil', icone: 'home',         label: t('accueil')   };

  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace(onglet.route)}>
        <FontAwesome name={onglet.icone} size={22} color={actif === 'accueil' ? 'black' : 'darkgray'} />
        <Text style={[styles.label, actif === 'accueil' && styles.actif]}>{onglet.label}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/produits')}>
        <FontAwesome name="mobile" size={26} color={actif === 'produits' ? 'black' : 'darkgray'} />
        <Text style={[styles.label, actif === 'produits' && styles.actif]}>{t('produits')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/panier')}>
        <View style={styles.iconWrap}>
          <FontAwesome name="shopping-cart" size={22} color={compte > 0 ? 'tomato' : actif === 'panier' ? 'black' : 'darkgray'} />
          {compte > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{compte}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, actif === 'panier' && styles.actif, compte > 0 && styles.rouge]}>{t('panier')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/compte')}>
        <FontAwesome name="user" size={22} color={actif === 'compte' ? 'black' : 'darkgray'} />
        <Text style={[styles.label, actif === 'compte' && styles.actif]}>{t('compte')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav:      { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'gainsboro', backgroundColor: 'white', paddingVertical: 10, paddingBottom: 20 },
  btn:      { flex: 1, alignItems: 'center', gap: 4 },
  label:    { fontSize: 11, color: 'darkgray' },
  actif:    { color: 'black', fontWeight: '700' },
  rouge:    { color: 'tomato' },
  iconWrap: { position: 'relative', width: 26, height: 24, alignItems: 'center', justifyContent: 'center' },
  badge:    { position: 'absolute', top: -5, right: -8, backgroundColor: 'tomato', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt: { color: 'white', fontSize: 10, fontWeight: '800' },
});
