import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert, StyleSheet, SafeAreaView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getClients, supprimerClient, basculerAdmin, ajouterClient, modifierClientAdmin } from '../../db/database';
import { getUtilisateur } from '../../utils/session';
import AdminNavBar from '../../composants/AdminNavBar';
import EnTete from '../../composants/EnTete';
import confirmer from '../../utils/confirmer';
import t from '../../i18n';

export default function GererUsers() {
  const moi = getUtilisateur();
  const [clients, setClients] = useState([]);
  const [edition, setEdition] = useState(null); // null Ppour que le modal soit fermé

  async function charger() {
    setClients(await getClients());
  }

  useEffect(() => { charger(); }, []);

  function ouvrirAjout() {
    setEdition({ id: null, nom: '', mdp: '', adresse: '', courriel: '', admin: false });
  }

  function ouvrirModif(c) {
    setEdition({ id: c.id, nom: c.nom, mdp: '', adresse: c.adresse || '', courriel: c.courriel || '', admin: !!c.admin });
  }

  async function sauvegarder() {
    const { id, nom, mdp, adresse, courriel, admin } = edition;
    if (!nom) return Alert.alert(t('erreur'), t('nomObligatoire'));
    if (id === null && !mdp) return Alert.alert(t('erreur'), t('mdpObligatoire'));

    try {
      if (id === null) await ajouterClient(nom, mdp, admin, adresse, courriel);
      else             await modifierClientAdmin(id, nom, mdp, adresse, courriel);
    } catch (e) {
      return Alert.alert(t('erreur'), e.message || '');
    }
    setEdition(null);
    charger();
  }

  function supprimer(client) {
    if (client.id === moi && moi.id) return;
    confirmer(t('supprimer'), t('supprimer') + ' ' + client.nom + ' ?', async () => {
      await supprimerClient(client.id);
      charger();
    });
  }

  function toggleAdmin(client) {
    if (client.id === moi && moi.id) return;
    const action = client.admin ? t('retirerAdmin') : t('rendreAdmin');
    confirmer(t('confirmer'), action + ' : ' + client.nom + ' ?', async () => {
      await basculerAdmin(client.id);
      charger();
    });
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('utilisateurs')} />

      <TouchableOpacity style={styles.btnAjouter} onPress={ouvrirAjout}>
        <Text style={styles.btnAjouterTxt}>{t('ajouterUtilisateur')}</Text>
      </TouchableOpacity>

      <FlatList
        data={clients}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const moiMeme = item.id === moi && moi.id;
          return (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.nom}>
                  {item.nom}
                  {item.admin ? <Text style={styles.badge}>  {t('badgeAdmin')}</Text> : null}
                  {moiMeme ? <Text style={styles.badgeMoi}>  {t('badgeVous')}</Text> : null}
                </Text>
                {item.courriel ? (
                  <Text style={styles.adresse}>
                    <FontAwesome name="envelope" size={11} color="gray" /> {item.courriel}
                  </Text>
                ) : null}
                {item.adresse ? <Text style={styles.adresse}>{item.adresse}</Text> : null}
              </View>

              <TouchableOpacity style={styles.btnModif} onPress={() => ouvrirModif(item)}>
                <Text style={styles.btnTxt}>{t('modifier')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAdmin, moiMeme && styles.btnDisabled]}
                onPress={() => toggleAdmin(item)}
                disabled={moiMeme}
              >
                <Text style={styles.btnTxt}>{item.admin ? t('retirerAdmin') : t('rendreAdmin')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSupp, moiMeme && styles.btnDisabled]}
                onPress={() => supprimer(item)}
                disabled={moiMeme}
              >
                <Text style={styles.btnTxt}>{t('supprimer')}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Modal ajout / modification */}
      <Modal visible={edition !== null} transparent animationType="slide" onRequestClose={() => setEdition(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>{edition && edition.id === null ? t('nouvelUtilisateur') : t('modifier')}</Text>

            <Text style={styles.label}>{t('nom')}</Text>
            <TextInput
              style={styles.input}
              value={edition && edition.nom}
              onChangeText={v => setEdition({ ...edition, nom: v })}
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              {t('motDePasse')} {edition && edition.id !== null && <Text style={styles.hint}>{t('videConserver')}</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={edition && edition.mdp}
              onChangeText={v => setEdition({ ...edition, mdp: v })}
              secureTextEntry
            />

            <Text style={styles.label}>{t('courriel')}</Text>
            <TextInput
              style={styles.input}
              value={edition && edition.courriel}
              onChangeText={v => setEdition({ ...edition, courriel: v })}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="exemple@courriel.com"
            />

            <Text style={styles.label}>{t('adresse')}</Text>
            <TextInput
              style={styles.input}
              value={edition && edition.adresse}
              onChangeText={v => setEdition({ ...edition, adresse: v })}
            />

            {edition && edition.id === null && (
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setEdition({ ...edition, admin: !edition.admin })}
              >
                <FontAwesome name={edition && edition.admin ? 'check-square-o' : 'square-o'} size={20} color="black" />
                <Text style={styles.checkLabel}>{t('donnerAdmin')}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalBoutons}>
              <TouchableOpacity style={styles.btnAnnuler} onPress={() => setEdition(null)}>
                <Text style={styles.btnAnnulerTxt}>{t('annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSauver} onPress={sauvegarder}>
                <Text style={styles.btnTxt}>{t('enregistrer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminNavBar actif="users" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  titre: { fontSize: 22, fontWeight: '800', color: 'black' },
  btnAjouter: { marginHorizontal: 16, backgroundColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  btnAjouterTxt: { color: 'white', fontWeight: '700', fontSize: 15 },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: 'gainsboro' },
  info: { gap: 4 },
  nom: { fontSize: 16, fontWeight: '700', color: 'black' },
  badge: { fontSize: 10, fontWeight: '700', color: 'white', backgroundColor: 'black' },
  badgeMoi: { fontSize: 10, fontWeight: '700', color: 'white', backgroundColor: 'dodgerblue' },
  adresse: { fontSize: 12, color: 'gray' },
  btnModif: { backgroundColor: 'dodgerblue', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnAdmin: { backgroundColor: 'mediumseagreen', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnSupp: { backgroundColor: 'tomato', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnTxt: { color: 'white', fontWeight: '600', fontSize: 13 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '90%', gap: 6 },
  modalTitre: { fontSize: 18, fontWeight: '800', color: 'black', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: 'dimgray', marginTop: 6 },
  hint: { fontSize: 11, fontWeight: '400', color: 'gray' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  check: { fontSize: 20 },
  checkLabel: { fontSize: 14, color: 'black' },
  modalBoutons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btnAnnuler: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: 'black', alignItems: 'center' },
  btnAnnulerTxt: { color: 'black', fontWeight: '700' },
  btnSauver: { flex: 2, backgroundColor: 'black', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
});
