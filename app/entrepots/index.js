import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getEntrepots } from '../../db/database';
import { getUtilisateur } from '../../utils/session';
import CarteEntrepots from '../../composants/CarteEntrepots';
import EnTete from '../../composants/EnTete';
import t from '../../i18n';

// adresse par défaut village du pere noel
const POS_DEFAUT = { latitude: 46.014515785647866, longitude: -74.21102284233022 };

// calcule de distance entre 2 points https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Entrepots() {
  const [entrepots, setEntrepots] = useState([]);
  const [selectionne, setSelectionne] = useState(null);

  // pos maison user
  const user = getUtilisateur();
  let POS_USER = POS_DEFAUT;
  if (user && user.latitude != null && user.longitude != null) {
    POS_USER = { latitude: user.latitude, longitude: user.longitude };
  }

  useEffect(() => {
    getEntrepots()
    .then(setEntrepots);
  }, []);

  // cherche l'entrepot le plus proche de la maison
  let plusProche = null;
  for (const e of entrepots) {
    const d = calcDistance(POS_USER.latitude, POS_USER.longitude, e.latitude, e.longitude);
    if (plusProche === null || d < plusProche.dist) {
      plusProche = { ...e, dist: d };
    }
  }
//selecitonner les entrepots
  function selectionner(e) {
    setSelectionne(e.id);
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('entrepotsTitre')} />

      <View style={styles.contenu}>
        {/* 25% — Liste entrepots */}
        <ScrollView style={styles.liste} contentContainerStyle={{ padding: 8, gap: 8 }}>
          {entrepots.map(e => {
            const dist = calcDistance(POS_USER.latitude, POS_USER.longitude, e.latitude, e.longitude);
            const estProche = plusProche && e.id === plusProche.id;
            const estActif  = e.id === selectionne;

            return (
              <Pressable
                key={e.id}
                style={[styles.item, estActif && styles.itemActif]}
                onPress={() => selectionner(e)}
              >
                <Text style={[styles.itemNom, estActif && styles.itemNomActif]} numberOfLines={1}>{e.nom}</Text>
                <View style={styles.distRow}>
                  <Text style={[styles.itemDist, estActif && styles.itemDistActif]}>{dist.toFixed(1)} {t('km')}</Text>
                  {estProche ? <FontAwesome name="star" size={12} color="orange" /> : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 75% — Carte */}
        <View style={styles.carteWrap}>
          <CarteEntrepots
            entrepots={entrepots}
            userPos={POS_USER}
            plusProcheId={plusProche && plusProche.id}
            selectionne={selectionne}
            onSelectionner={setSelectionne}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  contenu:    { flex: 1, flexDirection: 'row' },

  // liste
  liste:      { width: '25%', backgroundColor: 'white', borderRightWidth: 1, borderRightColor: 'gainsboro' },
  item:       { backgroundColor: 'whitesmoke', borderRadius: 8, padding: 8, gap: 2, borderWidth: 1, borderColor: 'gainsboro' },
  itemActif:  { backgroundColor: 'black', borderColor: 'black' },
  itemNom:    { fontSize: 12, fontWeight: '700', color: 'black' },
  itemNomActif: { color: 'white' },
  itemDist:   { fontSize: 11, fontWeight: '600', color: 'dodgerblue' },
  itemDistActif: { color: '#7ab8ff' },
  distRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },

 //map
  carteWrap:  { width: '75%' },
});
