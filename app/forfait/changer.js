import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FORFAITS, getAbonnementActif, changerForfait } from '../../db/database';
import { getUtilisateur } from '../../utils/session';
import EnTete from '../../composants/EnTete';
import t, { formatPrix } from '../../i18n';

export default function ChangerForfait() {
  const user = getUtilisateur();
  const [forfaitId, setForfaitId] = useState('standard');
  const [appelsInter, setAppelsInter] = useState(false);

  //voir abonnement du user
  useEffect(() => {
    if (!user) return;
    getAbonnementActif(user.id)
    .then(a => {
      if (a) {
        setForfaitId(a.forfait_id);
        setAppelsInter(a.appels_internationaux === 1);
      }
    });
  }, []);

  //confirmer changement
  async function confirmer() {
    if (forfaitId === 'aucun') return;
    await changerForfait(user.id, forfaitId, appelsInter);
    router.back();
  }

  const forfaitChoisi = FORFAITS.find(f => f.id === forfaitId);
  const prixMensuel = forfaitChoisi.mensuel + (appelsInter ? 10 : 0);

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('changerForfaitTitre')} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.retour}>{t('retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{t('changerForfaitTitre')}</Text>
      </View>
{/*il faut enlever auun forfait parce qu'il y a déjà annuler*/}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.section}>{t('choisirNouveauForfait')}</Text>

        {FORFAITS.filter(f => f.id !== 'aucun').map(f => {
          const actif = f.id === forfaitId;
          return (
            <TouchableOpacity key={f.id} style={[styles.boite, actif && styles.boiteActif]} onPress={() => setForfaitId(f.id)}>
              <Text style={styles.boiteNom}>{f.nom}</Text>
              <Text style={styles.boitePrix}>{formatPrix(f.mensuel)} {t('parMois')}</Text>
              <Text style={styles.boiteInfo}>
                <FontAwesome name="wifi" size={11} color="gray" /> {f.data}  ·  <FontAwesome name="phone" size={11} color="gray" /> {f.appels}
              </Text>
            </TouchableOpacity>
          );
        })}
{/*case appel internationaux*/}
        <TouchableOpacity style={styles.toggle} onPress={() => setAppelsInter(!appelsInter)}>
          <FontAwesome name={appelsInter ? 'check-square-o' : 'square-o'} size={20} color="black" />
          <Text style={styles.toggleTxt}>{t('appelsInter')} (+{formatPrix(10)} {t('parMois')})</Text>
        </TouchableOpacity>

        <View style={styles.total}>
          <Text style={styles.totalTxt}>{t('total')} : {formatPrix(prixMensuel)} {t('parMois')}</Text>
        </View>
      </ScrollView>

      <View style={styles.barre}>
        <TouchableOpacity style={styles.btnAnnuler} onPress={() => router.back()}>
          <Text style={styles.btnAnnulerTxt}>{t('annuler')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnConfirmer} onPress={confirmer}>
          <Text style={styles.btnConfirmerTxt}>{t('confirmer')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 16 },
  retour: { fontSize: 15, fontWeight: '600', color: 'black' },
  titre: { fontSize: 20, fontWeight: '800', color: 'black' },
  section: { fontSize: 16, fontWeight: '700', color: 'black', marginBottom: 10 },
  boite: { backgroundColor: 'white', borderRadius: 10, padding: 14, borderWidth: 1.5, borderColor: 'gainsboro', marginBottom: 10, gap: 4 },
  boiteActif: { borderColor: 'black' },
  boiteNom: { fontSize: 15, fontWeight: '700', color: 'black' },
  boitePrix: { fontSize: 13, color: 'dimgray' },
  boiteInfo: { fontSize: 12, color: 'gray' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: 'gainsboro', marginTop: 8 },
  check: { fontSize: 20 },
  toggleTxt: { fontSize: 14, color: 'black' },
  total: { backgroundColor: 'black', padding: 14, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  totalTxt: { color: 'white', fontSize: 16, fontWeight: '800' },
  barre: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: 'gainsboro', backgroundColor: 'white' },
  btnAnnuler: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, borderColor: 'black' },
  btnAnnulerTxt: { color: 'black', fontWeight: '700' },
  btnConfirmer: { flex: 1, backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnConfirmerTxt: { color: 'white', fontWeight: '700' },
});
