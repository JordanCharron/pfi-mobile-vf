import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { modifierClient } from '../../db/database';
import { getUtilisateur, setUtilisateur, deconnecter } from '../../utils/session';
import NavBar from '../../composants/NavBar';
import AdminNavBar from '../../composants/AdminNavBar';
import EnTete from '../../composants/EnTete';
import { commun } from '../../composants/styles';
import t from '../../i18n';

const LANGUES = ['fr', 'en', 'auto'];

// recherche d'adresse API Photon  https://photon.komoot.io/
async function chercherAdresses(query) {
  const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(query) + '&lang=fr&limit=10';
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data || !data.features) return [];

  // prend 5 résultat seulement si au canada
  const resultats = [];
  for (let i = 0; i < data.features.length && resultats.length < 5; i++) {
    const f = data.features[i];
    const p = f.properties || {};
    if (p.countrycode !== 'CA') continue;

    let coords = [0, 0];
    if (f.geometry) {
      coords = f.geometry.coordinates;
    }
    const lon = coords[0];
    const lat = coords[1];

    // rend l'adresse en texte
    let texte = '';
    if (p.housenumber && p.street) texte = p.housenumber + ' ' + p.street;
    else if (p.street) texte = p.street;
    else if (p.name) texte = p.name;
    if (p.city) texte += ', ' + p.city;
    if (p.state) texte += ', ' + p.state;
    if (p.postcode) texte += ', ' + p.postcode;

    resultats.push({
      place_id: p.osm_id || (i + '-' + lat + '-' + lon),
      display_name: texte,
      lat: String(lat),
      lon: String(lon),
    });
  }
  return resultats;
}

export default function Compte() {
  const user = getUtilisateur();
  const [mdp, setMdp] = useState(user && user.mdp ? user.mdp : '');
  const [adresse, setAdresse] = useState(user && user.adresse ? user.adresse : '');
  const [courriel, setCourriel] = useState(user && user.courriel ? user.courriel : '');
  const [langue, setLangue] = useState(user && user.langue_prefere ? user.langue_prefere : 'fr');

  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [coords, setCoords] = useState({
    lat: user && user.latitude ? user.latitude : null,
    lon: user && user.longitude ? user.longitude : null,
  });

  // attend 400ms quand le user arrête de taper avant de lancer la recherche
  useEffect(() => {
    // si l'adresse a une , on enleve les suggestion pour les faire disparaitre de l'écran
    if (!adresse || adresse.length < 3 || adresse.includes(',')) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      chercherAdresses(adresse)
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [adresse]);

  function choisirSuggestion(s) {
    setAdresse(s.display_name);
    setSuggestions([]);
    setCoords({ lat: Number(s.lat), lon: Number(s.lon) });
  }

//changer la langue
function choisirLangue(l) {
  setLangue(l);
  setUtilisateur({ ...user, langue_prefere: l });
}

  function enregistrer() {
    modifierClient(user.id, adresse, mdp, langue, courriel, coords.lat, coords.lon)
      .then(() => {
        setUtilisateur({ ...user, adresse, mdp, courriel, langue_prefere: langue, latitude: coords.lat, longitude: coords.lon });
        Alert.alert(t('profilMisAJour'));
      });
  }

  function seDeconnecter() {
    deconnecter();
    router.replace('/');
  }

  // bloc qui affiche la roue qui tourne pendant la recherche
  let blocChargement = null;
  if (searching) {
    blocChargement = (
      <View style={styles.searchingRow}>
        <ActivityIndicator size="small" color="gray" />
        <Text style={styles.searchingTxt}>{t('rechercheAdresse')}</Text>
      </View>
    );
  }

  // bloc qui affiche la liste des suggestions d'adresses
  let blocSuggestions = null;
  if (suggestions.length > 0) {
    blocSuggestions = (
      <View style={styles.suggestionsList}>
        {suggestions.map((s, i) => (
          <TouchableOpacity
            key={s.place_id || i}
            style={[styles.suggestion, i === suggestions.length - 1 && styles.suggestionLast]}
            onPress={() => choisirSuggestion(s)}
          >
            <Text style={styles.suggestionTxt} numberOfLines={2}>{s.display_name || ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // bloc qui affiche "aucune adresse trouvée" quand la recherche ne donne rien
  let blocAucuneAdresse = null;
  if (!searching && adresse && adresse.length >= 3 && suggestions.length === 0 && !adresse.includes(',')) {
    blocAucuneAdresse = (
      <View style={styles.aucunResultat}>
        <Text style={styles.aucunResultatTxt}>{t('aucuneAdresseTrouvee')}</Text>
      </View>
    );
  }

 {/*femre le clavier quand on pese sur une suggestions*/}
  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('compte')} />

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>{t('nomLectureSeule')}</Text>
        <View style={styles.inputInterdit}>
          <Text style={styles.inputInterditTxt}>{user && user.nom}</Text>
        </View>

        <Text style={styles.label}>{t('motDePasse')}</Text>
        <TextInput style={styles.input} value={mdp} onChangeText={setMdp} secureTextEntry />

        <Text style={styles.label}>{t('courriel')}</Text>
        {/*donne le clavier avec le @ pour que ce soit plus facile pour le user et pas de majuscule auto pour le password*/}
        <TextInput
          style={styles.input}
          value={courriel}
          onChangeText={setCourriel}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="exemple@courriel.com"
        />

        <Text style={styles.label}>{t('adresse')}</Text>
        <View>
          <TextInput
            style={styles.input}
            value={adresse}
            onChangeText={setAdresse}
            placeholder="1234 rue..."
          />
      
          {blocChargement}
          {blocSuggestions}
          {blocAucuneAdresse}
        </View>

        <Text style={styles.label}>{t('langue')}</Text>
        <View style={styles.radioRow}>
          {LANGUES.map(l => (
            <TouchableOpacity key={l} style={[styles.radio, langue === l && styles.radioActif]} onPress={() => choisirLangue(l)}>
              <Text style={[styles.radioTxt, langue === l && styles.radioTxtActif]}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={enregistrer}>
          <Text style={styles.btnTxt}>{t('enregistrer')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnEntrepot} onPress={() => router.push('/favoris')}>
          <Text style={styles.btnEntrepotTxt}>{t('mesFavoris')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnEntrepot} onPress={() => router.push('/entrepots')}>
          <Text style={styles.btnEntrepotTxt}>{t('voirEntrepots')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDeconnexion} onPress={seDeconnecter}>
          <Text style={styles.btnDeconnexionTxt}>{t('deconnexion')}</Text>
        </TouchableOpacity>
      </ScrollView>

    {/*change le navbar si admin*/}
      {user && user.admin ? <AdminNavBar actif="compte" /> : <NavBar actif="compte" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...commun,
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  titre: { fontSize: 22, fontWeight: '800', color: 'black' },
  userNom: { fontSize: 13, color: 'gray' },
  form: { flex: 1, paddingHorizontal: 20 },
  formContent: { paddingTop: 8, paddingBottom: 24, gap: 8 },
  inputInterdit: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: 'gainsboro', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  inputInterditTxt: { fontSize: 15, color: 'gray' },
  radioRow: { flexDirection: 'row', gap: 10 },
  radio: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'gainsboro', backgroundColor: 'white', alignItems: 'center' },
  radioActif: { backgroundColor: 'black', borderColor: 'black' },
  radioTxt: { fontWeight: '600', color: 'gray' },
  radioTxtActif: { color: 'white' },
  btn: { backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
  btnEntrepot: { borderWidth: 1, borderColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnEntrepotTxt: { color: 'black', fontWeight: '600' },
  btnDeconnexion: { backgroundColor: 'tomato', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnDeconnexionTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
  searchingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 4 },
  searchingTxt: { fontSize: 12, color: 'gray', fontStyle: 'italic' },
  suggestionsList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gainsboro',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestion: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionLast: { borderBottomWidth: 0 },
  suggestionTxt: { fontSize: 13, color: 'black' },
  aucunResultat: { marginTop: 6, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FFE0E0' },
  aucunResultatTxt: { fontSize: 12, color: '#aa3333', fontStyle: 'italic', textAlign: 'center' },
});
