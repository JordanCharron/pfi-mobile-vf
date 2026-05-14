import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, SafeAreaView, ScrollView, Share, Switch } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getProduits, FORFAITS } from '../../db/database';
import { setForfaitEnAttente } from '../../utils/session';
import { usePanier } from '../../composants/PanierContext';
import EnTete from '../../composants/EnTete';
import t, { formatPrix } from '../../i18n';

// options pour configurer un téléphone
const CAPACITES = [
  { taille: '128 Go', supplement: 0 },
  { taille: '256 Go', supplement: 200 },
  { taille: '512 Go', supplement: 500 },
  { taille: '1 To',   supplement: 800 },
];

const COULEURS = [
  { nom: 'Noir',   hex: 'black' },
  { nom: 'Blanc',  hex: '#f4f1ea' },
  { nom: 'Bleu',   hex: '#005ef5' },
  { nom: 'Argent', hex: '#c0c0c0' },
];

const PRIX_APPLECARE = 200;
const NB_ETAPES = 4;

function parsePrix(s) {
  return parseFloat(String(s).replace(/[^0-9]/g, '')) || 0;
}

export default function Detail() {
  const { id } = useLocalSearchParams();
  const { ajouter } = usePanier();
  const [produit, setProduit] = useState(null);
  const [etape, setEtape] = useState(1);

  // les options choisies dans le stepper
  const [capacite, setCapacite] = useState(CAPACITES[0]);
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [forfait, setForfait] = useState(FORFAITS[0]);
  const [appelsInter, setAppelsInter] = useState(false);
  const [applecare, setApplecare] = useState(false);
  const [ajoute, setAjoute] = useState(false);

  useEffect(() => {
    getProduits().then(liste => {
      setProduit(liste.find(p => p.id === Number(id)));
    });
  }, [id]);

  // si on change une option apres avoir ajoute, le bouton revient a "ajouter"
  useEffect(() => {
    setAjoute(false);
  }, [capacite, couleur, forfait, appelsInter, applecare]);

  // share doc https://reactnative.dev/docs/share
  function partager() {
    try {
      Share.share({
        title: produit && produit.nom,
        message: 'Regarde ce téléphone sur NovaTel : ' + (produit && produit.nom) + ' — ' + (produit && produit.prix),
      });
    } catch {}
  }


  if (!produit) return <View style={styles.root}><Text style={{ padding: 16 }}>{t('chargement')}</Text></View>;

  const estPhone = produit.categorie === 'Cellulaire';

  // accessoires
  if (!estPhone) {
    return (
      <SafeAreaView style={styles.root}>
        <EnTete titre={produit.nom} />
        <ScrollView>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.retour} onPress={() => router.back()}>
              <Text style={styles.retourTxt}>{t('retour')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPartager} onPress={partager} hitSlop={10}>
              <FontAwesome name="share-alt" size={18} color="dodgerblue" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: produit.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.nom}>{produit.nom}</Text>
            <Text style={styles.desc}>{produit.description}</Text>
            <Text style={styles.prix}>{formatPrix(produit.prix)}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => ajouter(produit)}>
              <Text style={styles.btnTxt}>{t('ajouterPanier')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // calculs des prix pour les téléphones
  const prixBase           = parsePrix(produit.prix);
  const prixApplecare      = applecare ? PRIX_APPLECARE : 0;
  const prixInitial        = prixBase + capacite.supplement + prixApplecare;
  const prixMensuel        = forfait.mensuel + (appelsInter && forfait.id !== 'aucun' ? 10 : 0);

  const nomConfig = produit.nom + ' · ' + capacite.taille + ' · ' + couleur.nom
    + (applecare ? ' · AppleCare+' : '');

  async function confirmer() {
   
    await ajouter({
      ...produit,
      nom:  nomConfig,
      prix: formatPrix(prixInitial),
    });
   
    if (forfait.id !== 'aucun') {
      setForfaitEnAttente({ forfaitId: forfait.id, appelsInter });
    }
    setAjoute(true);
  }

  // stepper
  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={produit.nom} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.retour} onPress={() => router.back()}>
            <Text style={styles.retourTxt}>{t('retour')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPartager} onPress={partager} hitSlop={10}>
            <FontAwesome name="share-alt" size={18} color="dodgerblue" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: produit.image }} style={styles.imageMini} />
        <Text style={styles.nom}>{produit.nom}</Text>

        {/* étapes en haut */}
        <View style={styles.stepper}>
          {[t('configuration'), t('forfait'), t('options'), t('recapitulatif')].map((titre, i) => {
            const n = i + 1;
            return (
              <View key={n} style={styles.stepWrap}>
                <View style={[styles.stepBulle, etape >= n && styles.stepBulleActif]}>
                  <Text style={[styles.stepBulleTxt, etape >= n && styles.stepBulleTxtActif]}>{n}</Text>
                </View>
                <Text style={[styles.stepLabel, etape === n && styles.stepLabelActif]}>{titre}</Text>
              </View>
            );
          })}
        </View>

        {/* étape 1 storage et couleur*/}
        {etape === 1 && (
          <View style={styles.bloc}>
            <Text style={styles.section}>{t('capacite')}</Text>
            {CAPACITES.map(c => {
              const actif = c.taille === capacite.taille;
              return (
                <TouchableOpacity key={c.taille} style={[styles.option, actif && styles.optionActif]} onPress={() => setCapacite(c)} activeOpacity={0.6}>
                  <Text style={[styles.optionNom, actif && styles.optionNomActif]}>{c.taille}</Text>
                  <Text style={[styles.optionPrix, actif && styles.optionPrixActif]}>
                    {c.supplement === 0 ? t('inclus') : '+' + formatPrix(c.supplement)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.section, { marginTop: 18 }]}>{t('couleur')}</Text>
            <View style={styles.couleursRow}>
              {COULEURS.map(c => {
                const actif = c.nom === couleur.nom;
                return (
                  <Pressable
                    key={c.nom}
                    onPress={() => setCouleur(c)}
                    hitSlop={12}
                    style={styles.couleurItem}
                  >
                    <View style={[styles.couleurCercle, { backgroundColor: c.hex }, actif && styles.couleurCercleActif]} />
                    <Text style={[styles.couleurNom, actif && styles.couleurNomActif]}>{c.nom}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* étape 2 forfait*/}
        {etape === 2 && (
          <View style={styles.bloc}>
            <Text style={styles.section}>{t('choisirForfait')}</Text>
            {FORFAITS.map(f => {
              const actif = f.id === forfait.id;
              return (
                <TouchableOpacity key={f.id} style={[styles.forfaitCard, actif && styles.optionActif]} onPress={() => setForfait(f)} activeOpacity={0.6}>
                  <View style={styles.forfaitHeader}>
                    <Text style={[styles.forfaitNom, actif && styles.optionNomActif]}>{f.nom}</Text>
                    <Text style={[styles.forfaitPrix, actif && styles.optionPrixActif]}>
                      {f.mensuel === 0 ? t('gratuit') : formatPrix(f.mensuel) + ' ' + t('parMois')}
                    </Text>
                  </View>
                  <View style={styles.forfaitDetails}>
                    <Text style={styles.forfaitInfo}>
                      <FontAwesome name="wifi" size={11} color="dimgray" /> {f.data}
                    </Text>
                    <Text style={styles.forfaitInfo}>
                      <FontAwesome name="phone" size={11} color="dimgray" /> {f.appels}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
                {/*toggle switch https://reactnative.dev/docs/switch*/}
            {forfait.id !== 'aucun' && (
              <TouchableOpacity style={styles.toggleRow} onPress={() => setAppelsInter(!appelsInter)} activeOpacity={0.7}>
                <Switch
                  value={appelsInter}
                  onValueChange={setAppelsInter}
                  trackColor={{ false: '#ccc', true: 'black' }}
                  thumbColor="white"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleNom}>{t('appelsInter')}</Text>
                  <Text style={styles.toggleSous}>{t('appelsInterDesc')}</Text>
                </View>
              </TouchableOpacity>
            )}

            {forfait.id !== 'aucun' && (
              <View style={styles.totalMensuel}>
                <Text style={styles.totalMensuelLbl}>{t('totalMensuel')}</Text>
                <Text style={styles.totalMensuelVal}>{formatPrix(prixMensuel)} {t('parMois')}</Text>
              </View>
            )}
          </View>
        )}

        {/* étape 3  AppleCare */}
        {etape === 3 && (
          <View style={styles.bloc}>
            <Text style={styles.section}>{t('protectionApplecare')}</Text>

            <TouchableOpacity style={[styles.option, !applecare && styles.optionActif]} onPress={() => setApplecare(false)} activeOpacity={0.6}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionNom, !applecare && styles.optionNomActif]}>Aucune protection</Text>
              </View>
              <Text style={[styles.optionPrix, !applecare && styles.optionPrixActif]}>{t('gratuit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.option, applecare && styles.optionActif]} onPress={() => setApplecare(true)} activeOpacity={0.6}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionNom, applecare && styles.optionNomActif]}>AppleCare+</Text>
                <Text style={styles.optionSous}>{t('duree')} 2 ans</Text>
              </View>
              <Text style={[styles.optionPrix, applecare && styles.optionPrixActif]}>+{formatPrix(PRIX_APPLECARE)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* étape 4 : récapitulatif de la commande */}
        {etape === 4 && (
          <View style={styles.bloc}>
            <Text style={styles.section}>{t('votreCommande')}</Text>
            <View style={styles.recap}>
              <Text style={styles.recapTitre}>
                <FontAwesome name="mobile" size={14} color="black" /> {t('telephone')}
              </Text>
              <Ligne label={t('modele')}   valeur={produit.nom} />
              <Ligne label={t('capacite')} valeur={capacite.taille} />
              <Ligne label={t('couleur')}  valeur={couleur.nom} />
              <Ligne label={t('prix')}     valeur={produit.prix} />
              {capacite.supplement > 0 && <Ligne label={t('plusCapacite')} valeur={'+' + formatPrix(capacite.supplement)} />}

              {applecare && (
                <>
                  <View style={styles.separateur} />
                  <Text style={styles.recapTitre}>
                    <FontAwesome name="shield" size={14} color="black" /> {t('protection')}
                  </Text>
                  <Ligne label="AppleCare+" valeur={'+' + formatPrix(PRIX_APPLECARE)} />
                </>
              )}

              <View style={styles.separateur} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('coutInitial')}</Text>
                <Text style={styles.totalValeur}>{formatPrix(prixInitial)}</Text>
              </View>

              {forfait.id !== 'aucun' && (
                <>
                  <View style={styles.separateur} />
                  <Text style={styles.recapTitre}>
                    <FontAwesome name="signal" size={14} color="black" /> {t('forfaitMobile')}
                  </Text>
                  <Ligne label={forfait.nom} valeur={formatPrix(forfait.mensuel) + ' ' + t('parMois')} />
                  {appelsInter && <Ligne label={t('appelsInter')} valeur={'+' + formatPrix(10) + ' ' + t('parMois')} />}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('mensualite')}</Text>
                    <Text style={[styles.totalValeur, { color: 'dodgerblue' }]}>{formatPrix(prixMensuel)} {t('parMois')}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Boutons de navigation stepper */}
      <View style={styles.barre}>
        {etape > 1 && (
          <TouchableOpacity style={styles.btnSecondaire} onPress={() => setEtape(etape - 1)}>
            <Text style={styles.btnSecondaireTxt}>{t('precedent')}</Text>
          </TouchableOpacity>
        )}
        {etape < NB_ETAPES ? (
          <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setEtape(etape + 1)}>
            <Text style={styles.btnTxt}>{t('suivant')}</Text>
          </TouchableOpacity>
        ) : ajoute ? (
          <TouchableOpacity style={[styles.btn, styles.btnPanier, { flex: 1 }]} onPress={() => router.push('/panier')}>
            <Text style={styles.btnTxt}>{t('allerPanier')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={confirmer}>
            <Text style={styles.btnTxt}>{t('ajouterPanier')} · {formatPrix(prixInitial)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
//plus facile que de le coder a chaque fois
function Ligne({ label, valeur }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneLabel}>{label}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  retour:       { padding: 16 },
  retourTxt:    { fontSize: 15, color: 'black', fontWeight: '600' },
  btnPartager:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E7F0FF', alignItems: 'center', justifyContent: 'center' },
  image:      { width: '100%', height: 280, resizeMode: 'cover' },
  imageMini:  { width: '50%', height: 160, alignSelf: 'center', resizeMode: 'contain', marginVertical: 4 },
  info:       { padding: 24, gap: 10 },
  nom:        { fontSize: 22, fontWeight: '800', color: 'black', textAlign: 'center', paddingHorizontal: 24 },
  desc:       { fontSize: 15, color: 'gray' },
  prix:       { fontSize: 28, fontWeight: '800', color: 'black', marginTop: 8 },
  btn:        { backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnPanier:  { backgroundColor: 'mediumseagreen' },
  btnTxt:     { color: 'white', fontWeight: '700', fontSize: 15 },

  stepper:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16, paddingHorizontal: 24 },
  stepWrap:       { alignItems: 'center', gap: 6, flex: 1 },
  stepBulle:      { width: 32, height: 32, borderRadius: 16, backgroundColor: 'gainsboro', alignItems: 'center', justifyContent: 'center' },
  stepBulleActif: { backgroundColor: 'black' },
  stepBulleTxt:   { color: 'gray', fontWeight: '700', fontSize: 14 },
  stepBulleTxtActif: { color: 'white' },
  stepLabel:      { fontSize: 11, color: 'gray', textAlign: 'center' },
  stepLabelActif: { color: 'black', fontWeight: '700' },

  bloc:           { paddingHorizontal: 20, paddingTop: 8 },
  section:        { fontSize: 16, fontWeight: '700', color: 'black', marginBottom: 10 },

  option:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: 'gainsboro', marginBottom: 8, gap: 10 },
  optionActif:    { borderColor: 'black' },
  optionNom:      { fontSize: 15, fontWeight: '600', color: 'black' },
  optionNomActif: { fontWeight: '800' },
  optionSous:     { fontSize: 12, color: 'gray', marginTop: 2 },
  optionPrix:     { fontSize: 13, color: 'gray', fontWeight: '600' },
  optionPrixActif:{ color: 'black' },

  couleursRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 },
  couleurItem:    { alignItems: 'center', gap: 6, padding: 12 },
  couleurCercle:  { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  couleurCercleActif: { borderColor: 'black' },
  couleurNom:     { fontSize: 12, color: 'gray' },
  couleurNomActif:{ color: 'black', fontWeight: '700' },

  // Forfait
  forfaitCard:    { backgroundColor: 'white', borderRadius: 10, padding: 14, borderWidth: 1.5, borderColor: 'gainsboro', marginBottom: 8, gap: 6 },
  forfaitHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forfaitNom:     { fontSize: 15, fontWeight: '700', color: 'black' },
  forfaitPrix:    { fontSize: 14, color: 'gray', fontWeight: '700' },
  forfaitDetails: { flexDirection: 'row', gap: 14, marginTop: 2 },
  forfaitInfo:    { fontSize: 12, color: 'dimgray' },

  // Toggle
  toggleRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, padding: 14, gap: 12, borderWidth: 1, borderColor: 'gainsboro', marginTop: 8 },
  toggleNom:      { fontSize: 14, fontWeight: '600', color: 'black' },
  toggleSous:     { fontSize: 12, color: 'gray', marginTop: 2 },

  totalMensuel:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', padding: 14, borderRadius: 10, marginTop: 12 },
  totalMensuelLbl:{ color: 'white', fontSize: 14, fontWeight: '600' },
  totalMensuelVal:{ color: 'white', fontSize: 18, fontWeight: '800' },

  // Récapitulatif
  recap:          { backgroundColor: 'white', borderRadius: 12, padding: 16, gap: 6, borderWidth: 1, borderColor: 'gainsboro' },
  recapTitre:     { fontSize: 14, fontWeight: '800', color: 'black', marginBottom: 2 },
  ligne:          { flexDirection: 'row', justifyContent: 'space-between' },
  ligneLabel:     { fontSize: 13, color: 'gray', flex: 1 },
  ligneValeur:    { fontSize: 13, color: 'black', fontWeight: '600' },
  separateur:     { height: 1, backgroundColor: 'gainsboro', marginVertical: 8 }, //fait une ligne comme sur une facture
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel:     { fontSize: 15, fontWeight: '800', color: 'black' },
  totalValeur:    { fontSize: 18, fontWeight: '800', color: 'black' },

  barre:          { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: 'gainsboro', backgroundColor: 'white' },
  btnSecondaire:  { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' },
  btnSecondaireTxt: { color: 'black', fontWeight: '700', fontSize: 14 },

});
