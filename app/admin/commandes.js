import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getCommandes, supprimerCommande } from '../../db/database';
import AdminNavBar from '../../composants/AdminNavBar';
import EnTete from '../../composants/EnTete';
import confirmer from '../../utils/confirmer';
import t, { formatPrix } from '../../i18n';


//pour avoir la date et l'heure des commandes clients https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function GererCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [selection, setSelection] = useState(null);

  //charge la liste quand il y a des modifications
  function charger() {
    getCommandes()
    .then(setCommandes);
  }

  useEffect(() => { charger(); }, []);

  function supprimer(commande) {
    confirmer(t('supprimer'), t('supprimer') + ' #' + commande.id + ' ?', () => {
      supprimerCommande(commande.id)
      .then(charger);
    });
  }
//rend le json en tableau + récupère les infos de la commande sélectionnée
  let itemsSelection = [];
  let idCommande = null;
  let nomClient = null;
  let dateCommande = '';
  let totalCommande = 0;
  if (selection) {
    itemsSelection = safeParse(selection.items_json);
    idCommande = selection.id;
    nomClient = selection.client_nom;
    dateCommande = formatDate(selection.date);
    totalCommande = selection.total;
  }
//ListEmptyComponent pour si la liste est vide le user a un message
// le modal est plus clean et c'est plus facile de retourner dans la liste après https://mui.com/material-ui/react-modal/
//modal : https://youtu.be/9DwGahSqcEc?si=IX3fkeYcKqpKkhwg
  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('commandes')} />

      <FlatList
        data={commandes}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.vide}>{t('aucuneCommande')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.boite} onPress={() => setSelection(item)}>
            <View style={styles.HeaderBoite}>
              <Text style={styles.numero}>#{item.id}</Text>
              <Text style={styles.total}>{formatPrix(item.total)}</Text>
            </View>
            <Text style={styles.client}>{item.client_nom}</Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <TouchableOpacity style={styles.btnSupp} onPress={() => supprimer(item)}>
              <Text style={styles.btnSuppTxt}>{t('supprimer')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal visible={selection !== null} transparent animationType="slide" onRequestClose={() => setSelection(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitre}>#{idCommande}</Text>
              <TouchableOpacity onPress={() => setSelection(null)}>
                <FontAwesome name="times" size={20} color="gray" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSous}>{nomClient} • {dateCommande}</Text>

            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 10 }}>
              {itemsSelection.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.itemImg} /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNom}>{item.nom}</Text>
                    <Text style={styles.itemPrix}>{item.prix} × {item.quantite}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLbl}>{t('total')}</Text>
              <Text style={styles.modalTotalVal}>{formatPrix(totalCommande)}</Text>
            </View>
          </View>
        </View>
      </Modal>

      <AdminNavBar actif="commandes" />
    </SafeAreaView>
  );
}
{/*check si les parse sont correct*/}
function safeParse(s) {
  try {
    return JSON.parse(s) || [];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  retour: { fontSize: 15, color: 'dodgerblue', width: 60 },
  titre: { fontSize: 20, fontWeight: '800', color: 'black' },
  vide: { textAlign: 'center', color: 'gray', marginTop: 40 },
  boite: { backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: 'gainsboro' },
  HeaderBoite: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontSize: 16, fontWeight: '800', color: 'black' },
  total: { fontSize: 16, fontWeight: '800', color: 'black' },
  client: { fontSize: 14, color: '#444' },
  date: { fontSize: 12, color: 'gray' },
  btnSupp: { marginTop: 6, backgroundColor: 'tomato', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  btnSuppTxt: { color: 'white', fontWeight: '600', fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '90%', gap: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitre: { fontSize: 18, fontWeight: '800', color: 'black' },
  fermer: { fontSize: 22, color: 'gray', paddingHorizontal: 6 },
  modalSous: { fontSize: 13, color: 'gray' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, backgroundColor: 'whitesmoke', borderRadius: 8 },
  itemImg: { width: 44, height: 44, borderRadius: 6, resizeMode: 'cover' },
  itemNom: { fontSize: 13, fontWeight: '700', color: 'black' },
  itemPrix: { fontSize: 12, color: 'gray', marginTop: 2 },
  modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'gainsboro', paddingTop: 12, marginTop: 6 },
  modalTotalLbl: { fontSize: 15, fontWeight: '700', color: 'black' },
  modalTotalVal: { fontSize: 16, fontWeight: '800', color: 'black' },
});
