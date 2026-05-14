import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAbonnementActif, annulerAbonnement, getCommandesClient } from '../../db/database';
import { getUtilisateur } from '../../utils/session';
import NavBar from '../../composants/NavBar';
import AdminNavBar from '../../composants/AdminNavBar';
import EnTete from '../../composants/EnTete';
import confirmer from '../../utils/confirmer';
import t, { formatPrix } from '../../i18n';


function extraireGaranties(commandes) {
  const liste = [];
  const maintenant = new Date();

  for (const cmd of commandes) {
    let items = [];
    try {
      items = JSON.parse(cmd.items_json) || [];
    } catch {}

    for (const item of items) {
      if (!item.nom) continue;
      if (!item.nom.toLowerCase().includes('applecare')) continue;

      // AppleCare dure 2 ans
      const dateAchat = new Date(cmd.date);
      const dateExpire = new Date(dateAchat);
      dateExpire.setFullYear(dateExpire.getFullYear() + 2);

      const appareil = item.nom;

      liste.push({
        id: cmd.id + '-' + (item.id || appareil),   // id unique pour la key React
        appareil: appareil,                          // nom complet
        image: item.image,
        dateAchat: dateAchat,
        dateExpire: dateExpire,                 // dateAchat + 2 ans
        valide: dateExpire > maintenant,         // true si pas encore expirée
      });
    }
  }
  return liste;
}

export default function MonForfait() {
  const user = getUtilisateur();
  const [abonnement, setAbonnement] = useState(null);
  const [garanties, setGaranties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function charger() {
    if (!user) return;
    setAbonnement(await getAbonnementActif(user.id));
    const cmds = await getCommandesClient(user.id);
    setGaranties(extraireGaranties(cmds));
  }
//quand le user tire vers le bas l'écrant rafraichi
  function rafraichir() {
    setRefreshing(true);
    charger()
    .then(() => setRefreshing(false));
  }

  useEffect(() => {
    charger();
  }, []);

  //il y a un popup pour etre certain utils/confirmer
  function annuler() {
    confirmer(t('annuler'), t('annulerAbonnement'), () => {
      annulerAbonnement(user.id)
      .then(charger);
    });
  }

  // bloc qui affiche la liste des garanties AppleCare (si l'usager en a)
  let blocGaranties = null;
  if (garanties.length > 0) {
    blocGaranties = (
      <>
        <Text style={styles.section}>
          <FontAwesome name="shield" size={16} color="black" /> {t('mesGaranties')}
        </Text>
        {garanties.map(g => (
          <View key={g.id} style={styles.cardGarantie}>
            <Text style={styles.garAppareil}>{g.appareil}</Text>
            <Text style={styles.garDate}>{t('achetee')} {g.dateAchat.toLocaleDateString('fr-CA')}</Text>
            <View style={styles.garFooter}>
              <Text style={styles.garExpire}>{t('valideJusqu')} {g.dateExpire.toLocaleDateString('fr-CA')}</Text>
              <Text style={[styles.garBadge, g.valide ? styles.garValide : styles.garExpiree]}>
                {g.valide ? t('garantieValide') : t('garantieExpiree')}
              </Text>
            </View>
          </View>
        ))}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('monForfait')} />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={rafraichir} />}  //l'option refresh https://reactnative.dev/docs/refreshcontrol
      >
        {abonnement ? (
          <View style={styles.cardAbo}>
            <Text style={styles.aboNom}>{abonnement.forfait_nom}</Text>
            <Text style={styles.aboStatut}>{t('actif')}</Text>
            <Text style={styles.aboPrix}>{formatPrix(abonnement.forfait_mensuel + (abonnement.appels_internationaux ? 10 : 0))} {t('parMois')}</Text>
            <Text style={styles.aboDetail}>
              <FontAwesome name="wifi" size={11} color="dimgray" /> {abonnement.forfait_data_inclus ? abonnement.forfait_data_inclus + ' Go' : t('dataIllimite')}
            </Text>
            <Text style={styles.aboDetail}>
              <FontAwesome name="phone" size={11} color="dimgray" /> {abonnement.forfait_minutes_inclus ? abonnement.forfait_minutes_inclus + ' min' : t('appelsIllimites')}
            </Text>
            {abonnement.appels_internationaux ? (
              <Text style={styles.aboDetail}>
                <FontAwesome name="globe" size={11} color="dimgray" /> {t('appelsInter')}
              </Text>
            ) : null}

            <View style={styles.aboBoutons}>
              <TouchableOpacity style={styles.btnChanger} onPress={() => router.push('/forfait/changer')}>
                <Text style={styles.btnTxt}>{t('changer')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAnnuler} onPress={annuler}>
                <Text style={styles.btnTxt}>{t('annuler')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cardVide}>
            <Text style={styles.videTitre}>{t('aucunAbonnement')}</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/produits')}>
              <Text style={styles.btnTxt}>{t('voirTelephones')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {blocGaranties}
      </ScrollView>

      {user && user.admin ? <AdminNavBar actif="compte" /> : <NavBar actif="accueil" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },

  cardAbo: { backgroundColor: 'white', borderRadius: 12, padding: 16, gap: 4, borderWidth: 1, borderColor: 'gainsboro' },
  aboNom: { fontSize: 18, fontWeight: '800', color: 'black' },
  aboStatut: { fontSize: 12, color: 'mediumseagreen', fontWeight: '700' },
  aboPrix: { fontSize: 16, fontWeight: '800', color: 'black', marginTop: 4 },
  aboDetail: { fontSize: 12, color: 'dimgray' },
  aboBoutons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnChanger: { flex: 1, backgroundColor: 'dodgerblue', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnAnnuler: { flex: 1, backgroundColor: 'tomato', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnPrimary: { backgroundColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: 'white', fontWeight: '700' },

  cardVide: { backgroundColor: 'white', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'gainsboro', gap: 10 },
  videTitre: { fontSize: 15, color: 'gray' },

  section: { fontSize: 16, fontWeight: '700', color: 'black', marginTop: 16 },


  cardGarantie: { backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: 'gainsboro' },
  garAppareil: { fontSize: 14, fontWeight: '800', color: 'black' },
  garDate: { fontSize: 11, color: 'gray', marginTop: 2 },
  garFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  garExpire: { fontSize: 12, fontWeight: '600', color: 'black' },
  garBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  garValide: { backgroundColor: '#E8F8EE', color: '#1f9a4a' },
  garExpiree: { backgroundColor: '#FFE5E5', color: '#c25400' },
});
