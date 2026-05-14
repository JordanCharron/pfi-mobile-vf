import { useState, useEffect, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, Modal, ScrollView, RefreshControl, StyleSheet, SafeAreaView, Animated, Dimensions, Alert } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import * as Haptics from 'expo-haptics'
import ConfettiCannon from 'react-native-confetti-cannon'
import { creerAbonnement, changerForfait, getAbonnementActif, FORFAITS } from '../../db/database'
import { getUtilisateur, getForfaitEnAttente, effacerForfaitEnAttente } from '../../utils/session'
import { envoyerCourrielCommande } from '../../utils/email'
import NavBar from '../../composants/NavBar'
import EnTete from '../../composants/EnTete'
import { usePanier } from '../../composants/PanierContext'
import t, { formatPrix } from '../../i18n'

const RACHATS = [
  { id: 9001, marque: 'Google',  prix: '-150 $', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80' },
  { id: 9002, marque: 'Samsung', prix: '-150 $', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&q=80' },
  { id: 9003, marque: 'Apple',   prix: '-200 $', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&q=80' },
]

const Panier = () => {
  const { items, total, ajouter, retirer, modifierQuantite, vider, passerCommande, recharger } = usePanier()
  const [modal, setModal] = useState(false)
  const [recap, setRecap] = useState({ items: [], total: 0, forfait: null, intl: false })
  const [forfaitPending, setForfaitPending] = useState(getForfaitEnAttente())
  const [refreshing, setRefreshing] = useState(false)
  const user = getUtilisateur()
  const forfaitInfo = forfaitPending ? FORFAITS.find(f => f.id === forfaitPending.forfaitId) : null
//animation du panier https://reactnative.dev/docs/animated
  const bounce = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 600, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,   duration: 600, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  //voir le forfait dan panier
  useEffect(() => {
    setForfaitPending(getForfaitEnAttente())
  }, [])
//refrech la page en tirant cers le bars
  const rafraichir = async () => {
    setRefreshing(true)
    await recharger()
    setRefreshing(false)
  }
//le haptic sert a faire vibre le cell quand on pese sur le bouton
  const changerQuantite = async (id, quantite) => {
    Haptics.selectionAsync()
    await modifierQuantite(id, quantite)
  }

  const supprimer = (id) => retirer(id)

  const ajouterRachat = async (rachat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await ajouter({ id: rachat.id, nom: 'Rachat — ' + rachat.marque, prix: rachat.prix, image: rachat.image })
  }

  const acheter = async () => {
    if (items.length === 0) return // pas d'achat si panier vide
    const itemsAchetes = [...items]
    const forfaitChoisi = forfaitInfo
    const appelsInt = forfaitPending !== null && forfaitPending.appelsInter //pour les appels internationaux

    try {
      const paye = await passerCommande(user)

      if (forfaitPending && user) {
        const actuel = await getAbonnementActif(user.id)
        if (actuel) await changerForfait(user.id, forfaitPending.forfaitId, forfaitPending.appelsInter)
        else        await creerAbonnement(user.id, forfaitPending.forfaitId, forfaitPending.appelsInter)
        effacerForfaitEnAttente()
        setForfaitPending(null)
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setRecap({ items: itemsAchetes, total: paye, forfait: forfaitChoisi, intl: appelsInt })
      setModal(true)

      // envoie le courriel
      envoyerCourrielCommande(user, itemsAchetes, paye, forfaitChoisi, appelsInt).catch(() => {})
    } catch (e) {
      Alert.alert(t('erreur'), e.message)
    }
  }

  const fermerModal = () => {
    setModal(false)
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('panier')} />

      <View style={styles.rachatSection}>
        <Text style={styles.rachatTitre}>{t('rachat')}</Text>
        <View style={styles.rachatBtns}>
          {RACHATS.map(r => (
            <TouchableOpacity key={r.id} style={styles.rachatBtn} onPress={() => ajouterRachat(r)}>
              <Text style={styles.rachatBtnNom}>{r.marque}</Text>
              <Text style={styles.rachatBtnPrix}>{r.prix}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
{/*affiche seulement si forfait info https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND*/}
      {forfaitInfo && (
        <View style={styles.forfaitCard}>
          <View style={styles.forfaitHeader}>
            <Text style={styles.forfaitTitre}>
              <FontAwesome name="signal" size={14} color="mediumblue" /> {t('forfait')} {forfaitInfo.nom}
            </Text>
            <Text style={styles.forfaitPrix}>
              {formatPrix(forfaitInfo.mensuel + (forfaitPending.appelsInter ? 10 : 0))} {t('parMois')}
            </Text>
          </View>
          <Text style={styles.forfaitDetail}>
            <FontAwesome name="wifi" size={11} color="mediumblue" /> {forfaitInfo.data}  ·  <FontAwesome name="phone" size={11} color="mediumblue" /> {forfaitInfo.appels}
          </Text>
          {forfaitPending.appelsInter && (
            <Text style={styles.forfaitDetail}>
              <FontAwesome name="globe" size={11} color="mediumblue" /> {t('appelsInter')}
            </Text>
          )}
          <Text style={styles.forfaitNote}>{t('forfaitActiveApresAchat')}</Text>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.vide}>
          <Animated.View style={{ transform: [{ translateY: bounce }] }}>
            <FontAwesome name="shopping-cart" size={60} color="grey" />
          </Animated.View>
          <Text style={styles.videTexte}>{t('panierVide')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={rafraichir} />}
            renderItem={({ item }) => {
              const prixUnit = parseFloat(item.prix.replace(/[^0-9\-]/g, '')) //transforme en float
              const prixTotal = prixUnit * item.quantite
              return (
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.miniature} />
                  <View style={styles.info}>
                    <Text style={styles.nom}>{item.nom}</Text>
                    <Text style={styles.prixUnit}>{formatPrix(item.prix)} / {t('unite')}</Text>
                    <Text style={styles.prixTotal}>{t('total')} : {formatPrix(prixTotal)}</Text>
                    <View style={styles.qteRow}>
                      <TouchableOpacity style={styles.qteBtn} onPress={() => changerQuantite(item.id, item.quantite - 1)}>
                        <Text style={styles.qteBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qte}>{item.quantite}</Text>
                      <TouchableOpacity style={styles.qteBtn} onPress={() => changerQuantite(item.id, item.quantite + 1)}>
                        <Text style={styles.qteBtnTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => supprimer(item.id)}>
                    <FontAwesome name="trash" size={20} color="grey" />
                  </TouchableOpacity>
                </View>
              )
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.total}>{t('total')} : {formatPrix(total)}</Text>
            <View style={styles.btns}>
              <TouchableOpacity style={styles.btnVider} onPress={vider}>
                <Text style={styles.btnViderTxt}>{t('vider')}</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={{ flex: 2 }} onPress={acheter}>
                <View style={styles.btnAcheter}>
                  <Text style={styles.btnAcheterTxt}>{t('acheter')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBoxLarge}>
            <Text style={styles.modalTitre}>{t('commandeConfirmee')}</Text>

            <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: 10 }}>
              {recap.items.length > 0 && (
                <View style={styles.recapSection}>
                  <Text style={styles.recapTitre}>
                    <FontAwesome name="mobile" size={14} color="black" /> {t('telephone')} & {t('accessoires')}
                  </Text>
                  {recap.items.map(it => (
                    <View key={it.id} style={styles.recapItem}>
                      {it.image ? <Image source={{ uri: it.image }} style={styles.recapImg} /> : null}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recapNom}>{it.nom}</Text>
                        <Text style={styles.recapPrix}>{formatPrix(it.prix)} × {it.quantite}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {recap.forfait && (
                <View style={styles.recapSection}>
                  <Text style={styles.recapTitre}>
                    <FontAwesome name="signal" size={14} color="black" /> {t('forfaitMobile')}
                  </Text>
                  <Text style={styles.recapForfaitNom}>{recap.forfait.nom}</Text>
                  <Text style={styles.recapForfaitDetail}>
                    <FontAwesome name="wifi" size={11} color="dimgray" /> {recap.forfait.data}  ·  <FontAwesome name="phone" size={11} color="dimgray" /> {recap.forfait.appels}
                  </Text>
                  {recap.intl && (
                    <Text style={styles.recapForfaitDetail}>
                      <FontAwesome name="globe" size={11} color="dimgray" /> {t('appelsInter')}
                    </Text>
                  )}
                  <Text style={styles.recapForfaitPrix}>
                    {formatPrix(recap.forfait.mensuel + (recap.intl ? 10 : 0))} {t('parMois')}
                  </Text>
                </View>
              )}

              <View style={styles.recapTotalBox}>
                <Text style={styles.modalTotalLbl}>{t('totalPaye')}</Text>
                <Text style={styles.modalTotal}>{formatPrix(recap.total)}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalBtn} onPress={fermerModal}>
              <Text style={styles.modalBtnTxt}>{t('continuer')}</Text>
            </TouchableOpacity>
          </View>
          {/*canon de conffetis https://www.npmjs.com/package/react-native-confetti-cannon*/}
          <ConfettiCannon count={200} origin={{ x: Dimensions.get('window').width / 2, y: 0 }} fadeOut autoStart explosionSpeed={350} fallSpeed={2500} />
        </View>
      </Modal>

      <NavBar actif="panier" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  rachatSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  rachatTitre: { fontSize: 14, fontWeight: '700', color: 'black', marginBottom: 8 },
  rachatBtns: { flexDirection: 'row', gap: 8 },
  rachatBtn: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', borderRadius: 10, padding: 10, alignItems: 'center' },
  rachatBtnNom: { fontSize: 13, fontWeight: '700', color: 'black' },
  rachatBtnPrix: { fontSize: 12, color: 'forestgreen', fontWeight: '700', marginTop: 2 },
  forfaitCard: { backgroundColor: '#E7F0FF', borderColor: 'dodgerblue', borderWidth: 1, marginHorizontal: 16, marginTop: 4, padding: 14, borderRadius: 12, gap: 6 },
  forfaitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forfaitTitre: { color: 'mediumblue', fontSize: 15, fontWeight: '800' },
  forfaitPrix: { color: 'mediumblue', fontSize: 16, fontWeight: '800' },
  forfaitDetail: { color: 'mediumblue', fontSize: 12 },
  forfaitNote: { color: '#5078B0', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  vide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  videTexte: { fontSize: 16, color: 'gray' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: 'gainsboro' },
  miniature: { width: 70, height: 70, borderRadius: 8, resizeMode: 'cover' },
  info: { flex: 1, gap: 3 },
  nom: { fontSize: 14, fontWeight: '700', color: 'black' },
  prixUnit: { fontSize: 12, color: 'gray' },
  prixTotal: { fontSize: 13, fontWeight: '700', color: 'black' },
  qteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  qteBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  qteBtnTxt: { color: 'white', fontSize: 18 },
  qte: { fontSize: 15, fontWeight: '700', color: 'black', minWidth: 20, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 80, left: 0, right: 0, backgroundColor: 'white', padding: 16, borderTopWidth: 1, borderTopColor: 'gainsboro' },
  total: { fontSize: 18, fontWeight: '800', color: 'black', marginBottom: 10 },
  btns: { flexDirection: 'row', gap: 10 },
  btnVider: { flex: 1, borderWidth: 1, borderColor: 'black', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnViderTxt: { color: 'black', fontWeight: '600' },
  btnAcheter: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'forestgreen' },
  btnAcheterTxt: { color: 'white', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBoxLarge: { backgroundColor: 'white', borderRadius: 20, padding: 24, width: '90%', maxHeight: '85%', gap: 10 },
  modalTitre: { fontSize: 22, fontWeight: '800', color: 'black' },
  modalTotal: { fontSize: 20, fontWeight: '800', color: 'black' },
  modalTotalLbl: { fontSize: 14, fontWeight: '700', color: 'black' },
  modalBtn: { backgroundColor: 'black', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnTxt: { color: 'white', fontWeight: '700' },
  recapSection: { backgroundColor: 'whitesmoke', borderRadius: 10, padding: 12, gap: 6 },
  recapTitre: { fontSize: 13, fontWeight: '800', color: 'black', marginBottom: 4 },
  recapItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recapImg: { width: 40, height: 40, borderRadius: 6, resizeMode: 'cover' },
  recapNom: { fontSize: 12, fontWeight: '700', color: 'black' },
  recapPrix: { fontSize: 11, color: 'gray', marginTop: 2 },
  recapForfaitNom: { fontSize: 14, fontWeight: '800', color: 'black' },
  recapForfaitDetail: { fontSize: 12, color: 'dimgray' },
  recapForfaitPrix: { fontSize: 14, fontWeight: '800', color: 'dodgerblue', marginTop: 4 },
  recapTotalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: 'gainsboro' },
})

export default Panier
