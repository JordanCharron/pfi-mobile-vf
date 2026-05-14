import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getEntrepots, ajouterEntrepot, modifierEntrepot, supprimerEntrepot } from '../../db/database';
import AdminNavBar from '../../composants/AdminNavBar';
import EnTete from '../../composants/EnTete';
import confirmer from '../../utils/confirmer';
import t from '../../i18n';

const VIDE = { id: null, nom: '', adresse: '', latitude: '', longitude: '' };

export default function GererEntrepots() {
  const [entrepots, setEntrepots] = useState([]);
  const [edition, setEdition] = useState(null); 

  function charger() {
    getEntrepots().then(setEntrepots);
  }

  useEffect(() => { charger(); }, []);
//ouvre form ajout
  function ouvrirAjout() {
    setEdition({ ...VIDE });
  }
//ouvre form modif
  function ouvrirModif(e) {
    setEdition({ id: e.id, nom: e.nom, adresse: e.adresse, latitude: String(e.latitude), longitude: String(e.longitude) });
  }

  async function sauvegarder() {
    const { id, nom, adresse, latitude, longitude } = edition;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!nom || !adresse || isNaN(lat) || isNaN(lng)) {
      Alert.alert(t('erreur'), t('champsObligatoires'));
      return;
    }
    if (id == null) {
      await ajouterEntrepot(nom, adresse, lat, lng);
    } else {
      await modifierEntrepot(id, nom, adresse, lat, lng);
    }
    setEdition(null);
    charger();
  }

  function supprimer(e) {
    confirmer(t('supprimer'), t('supprimer') + ' : ' + e.nom + ' ?', () => {
      supprimerEntrepot(e.id).then(charger);
    });
  }

  // titre du modal : "Nouvel entrepôt" si ajout, "Modifier" si modification
  let titreModal = t('modifier');
  if (edition && edition.id == null) {
    titreModal = t('nouvelEntrepot');
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('entrepotsTitre')} />

      <TouchableOpacity style={styles.btnAjouter} onPress={ouvrirAjout}>
        <Text style={styles.btnAjouterTxt}>{t('ajouterEntrepot')}</Text>
      </TouchableOpacity>
      {/*si vide il y a un message*/}
      <FlatList
        data={entrepots}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.vide}>{t('aucunEntrepot')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.nom}>{item.nom}</Text>
              <Text style={styles.adresse}>{item.adresse}</Text>
              <Text style={styles.coords}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, styles.btnModif]} onPress={() => ouvrirModif(item)}>
              <Text style={styles.btnTxt}>{t('modifier')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSupp]} onPress={() => supprimer(item)}>
              <Text style={styles.btnTxt}>{t('supprimer')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={edition !== null} transparent animationType="slide" onRequestClose={() => setEdition(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitre}>{titreModal}</Text>
              <TouchableOpacity onPress={() => setEdition(null)}>
                <FontAwesome name="times" size={20} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 8 }}>
              <Text style={styles.label}>{t('nom')}</Text>
              <TextInput style={styles.input} value={edition && edition.nom} onChangeText={v => setEdition({ ...edition, nom: v })} placeholder="Ex: Montréal" />

              <Text style={styles.label}>{t('adresse')}</Text>
              <TextInput style={styles.input} value={edition && edition.adresse} onChangeText={v => setEdition({ ...edition, adresse: v })} placeholder="1234 Rue ..." />

              <Text style={styles.label}>{t('latitude')}</Text>
              <TextInput style={styles.input} value={edition && edition.latitude} onChangeText={v => setEdition({ ...edition, latitude: v })} keyboardType="numeric" placeholder="45.5017" />

              <Text style={styles.label}>{t('longitude')}</Text>
              <TextInput style={styles.input} value={edition && edition.longitude} onChangeText={v => setEdition({ ...edition, longitude: v })} keyboardType="numeric" placeholder="-73.5673" />
            </ScrollView>

            <TouchableOpacity style={styles.btnSauver} onPress={sauvegarder}>
              <Text style={styles.btnSauverTxt}>{t('enregistrer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AdminNavBar actif="entrepots" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  titre: { fontSize: 22, fontWeight: '800', color: 'black' },
  btnAjouter: { marginHorizontal: 16, backgroundColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  btnAjouterTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
  vide: { textAlign: 'center', color: 'gray', marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 10, borderWidth: 1, borderColor: 'gainsboro' },
  info: { gap: 4 },
  nom: { fontSize: 16, fontWeight: '700', color: 'black' },
  adresse: { fontSize: 13, color: '#444' },
  coords: { fontSize: 11, color: 'gray' },
  btn: { paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnModif: { backgroundColor: 'dodgerblue' },
  btnSupp: { backgroundColor: 'tomato' },
  btnTxt: { color: 'white', fontWeight: '600', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '90%', gap: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitre: { fontSize: 18, fontWeight: '800', color: 'black' },
  fermer: { fontSize: 22, color: 'gray', paddingHorizontal: 6 },
  label: { fontSize: 13, fontWeight: '600', color: 'dimgray', marginTop: 4 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  btnSauver: { backgroundColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnSauverTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
});
{/*rgba(0,0,0,0.5) sert a changer l'opacité*/}