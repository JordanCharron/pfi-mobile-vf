import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { getUtilisateur } from '../../utils/session'
import NavBar from '../../composants/NavBar'
import EnTete from '../../composants/EnTete'
import t from '../../i18n'

const CATEGORIES = [
  { nom: 'Cellulaire', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80' },
  { nom: 'Accessoire', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80' },
]

const Accueil = () => {
  const user = getUtilisateur()

  let nomUser = ''
  if (user) {
    nomUser = user.nom
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('accueil')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.header}>
          <View>
            <Text style={styles.bienvenue}>{t('bonjour')}, {nomUser}</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} />
        </View>

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=900&q=95' }}
          style={styles.ImageTop}
        />

        <Text style={styles.Titre}>{t('categories')}</Text>
        <View style={styles.categoriesRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.nom}
              style={styles.catCard}
              onPress={() => router.push({ pathname: '/produits', params: { cat: cat.nom } })}
            >
              <Image source={{ uri: cat.image }} style={styles.ImageCat} />
              <Text style={styles.NomCat}>{cat.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.push('/produits')} activeOpacity={0.8} style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={styles.btnProduits}>
            <Text style={styles.btnProduitsTxt}>{t('tousLesProduits')}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.promo}>
          <Text style={styles.TitrePromo}>
            <FontAwesome name="fire" size={13} color= 'orange' /> {t('nouveaute')}
          </Text>
          <Text style={styles.promoTxt}>iPhone 17 Pro à partir de 1 499 $</Text>
        </View>

        <Text style={styles.Titre}>{t('rachat')}</Text>
        <View style={styles.boiteRachat}>
          <Image
            source={{ uri: 'https://lereflet.qc.ca/wp-content/uploads/sites/5/2024/08/Gorecell-rachat-telephone-cellulaire-intelligent-usage-quebec.jpg' }}
            style={styles.rachatImage}
          />
          <View style={styles.rachatBody}>
            <Text style={styles.rachatTitre}>{t('vendezAppareil')}</Text>
            <Text style={styles.rachatTxt}>{t('rachatDesc')}</Text>
            <View style={styles.rachatSteps}>
              <View style={styles.rachatStep}>
                <View style={styles.rachatStepNum}>
                  <Text style={styles.rachatStepNumTxt}>1</Text>
                </View>
                <Text style={styles.rachatStepTxt}>{t('rachatStep1')}</Text>
              </View>
              <View style={styles.rachatStep}>
                <View style={styles.rachatStepNum}>
                  <Text style={styles.rachatStepNumTxt}>2</Text>
                </View>
                <Text style={styles.rachatStepTxt}>{t('rachatStep2')}</Text>
              </View>
              <View style={styles.rachatStep}>
                <View style={styles.rachatStepNum}>
                  <Text style={styles.rachatStepNumTxt}>3</Text>
                </View>
                <Text style={styles.rachatStepTxt}>{t('rachatStep3')}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      <NavBar actif="accueil" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  bienvenue: { fontSize: 18, fontWeight: '800', color: 'black' },
  logoImg: { width: 36, height: 50, resizeMode: 'contain' },
  ImageTop: { width: '100%', height: 200, resizeMode: 'cover' },
  Titre: { fontSize: 17, fontWeight: '800', color: 'black', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  categoriesRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  catCard: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro' },
  ImageCat: { width: '100%', height: 110, resizeMode: 'cover' },
  NomCat: { fontSize: 14, fontWeight: '700', color: 'black', padding: 10 },
  btnProduits: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: 'black' },
  btnProduitsTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
  promo: { marginHorizontal: 16, marginTop: 16, backgroundColor: 'white', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: 'gainsboro', gap: 6 },
  TitrePromo: { fontSize: 13, fontWeight: '700', color: 'gray' },
  promoTxt: { fontSize: 16, fontWeight: '800', color: 'black' },
  boiteRachat: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'gainsboro' },
  rachatImage: { width: '100%', height: 160, resizeMode: 'cover' },
  rachatBody: { padding: 18, gap: 10 },
  rachatTitre: { fontSize: 18, fontWeight: '800', color: 'black' },
  rachatTxt: { fontSize: 13, color: 'gray' },
  rachatSteps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rachatStep: { alignItems: 'center', gap: 6, flex: 1 },
  rachatStepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  rachatStepNumTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  rachatStepTxt: { fontSize: 11, color: 'dimgray', textAlign: 'center', fontWeight: '600' },
})

export default Accueil
