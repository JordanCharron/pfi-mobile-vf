import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl, StyleSheet, SafeAreaView, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { PieChart } from 'react-native-chart-kit'
import { getProduits, supprimerProduit } from '../../db/database'
import AdminNavBar from '../../composants/AdminNavBar'
import EnTete from '../../composants/EnTete'
import t from '../../i18n'

const SCREEN_WIDTH = Dimensions.get('window').width
const GRAPH_WIDTH = SCREEN_WIDTH - 32
const COULEURS_CERCLE = ['dodgerblue', 'mediumseagreen', 'orange', 'tomato', 'mediumslateblue', 'pink']

const GRAPH_CONFIG = {
  backgroundGradientFrom: 'white',
  backgroundGradientTo: 'white',
  decimalPlaces: 0,
  color: () => 'dodgerblue',
  labelColor: () => 'black',
}

const Admin = () => {
  const [produits, setProduits] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const charger = () => {
    getProduits().then(setProduits)
  }

  const rafraichir = () => {
    setRefreshing(true)
    getProduits().then(liste => {
      setProduits(liste)
      setRefreshing(false)
    })
  }

  useEffect(() => {
    charger()
  }, [])
//les 
  const supprimer = (id, nom) => {
    Alert.alert(t('supprimer'), t('supprimer') + ' ' + nom + ' ?', [
      { text: t('annuler'), style: 'cancel' },
      { text: t('supprimer'), style: 'destructive', onPress: () => {
        supprimerProduit(id)
        .then(charger)
      }},
    ])
  }

  // preparation du graph
  const repartition = {}
  for (let i = 0; i < produits.length; i++) {
    const cat = produits[i].sous_categorie || 'Autre'
    repartition[cat] = (repartition[cat] || 0) + 1
  }
  const graphData = Object.entries(repartition).map(([nom, qty], i) => ({
    name: nom,
    population: qty,
    color: COULEURS_CERCLE[i % COULEURS_CERCLE.length],
    legendFontColor: 'black',
    legendFontSize: 11,
  }))
//ref pour le piechart https://github.com/indiespirit/react-native-chart-kit
  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('panneauAdmin')} />

      <FlatList
        data={produits}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={rafraichir} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 8 }}>
            {graphData.length > 0 && (
              <>
                <Text style={styles.section}>Produits par catégorie</Text>
                <View style={styles.chartWrap}>
                  <PieChart
                    data={graphData}
                    width={GRAPH_WIDTH}
                    height={180}
                    chartConfig={GRAPH_CONFIG}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10"
                  />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.btnAjouter} onPress={() => router.push('/admin/ajouter')}>
              <Text style={styles.btnAjouterTxt}>{t('ajouterProduit')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.miniature} />
            <View style={styles.info}>
              <Text style={styles.nom}>{item.nom}</Text>
              <Text style={styles.prix}>{item.prix}</Text>
            </View>
            <TouchableOpacity style={styles.btnModifier} onPress={() => router.push({ pathname: '/admin/modifier', params: { id: item.id } })}>
              <Text style={styles.btnModifierTxt}>{t('modifier')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSupprimer} onPress={() => supprimer(item.id, item.nom)}>
              <Text style={styles.btnSupprimerTxt}>{t('supprimer')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <AdminNavBar actif="produits" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  section: { fontSize: 15, fontWeight: '800', color: 'black', marginTop: 6 },
  chartWrap: { borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', paddingVertical: 6 },
  btnAjouter: { backgroundColor: 'black', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  btnAjouterTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: 'gainsboro' },
  miniature: { width: 60, height: 60, borderRadius: 8, resizeMode: 'cover' },
  info: { flex: 1 },
  nom: { fontSize: 14, fontWeight: '700', color: 'black' },
  prix: { fontSize: 13, color: 'gray', marginTop: 2 },
  btnModifier: { backgroundColor: 'dodgerblue', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnModifierTxt: { color: 'white', fontWeight: '600', fontSize: 12 },
  btnSupprimer: { backgroundColor: 'tomato', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnSupprimerTxt: { color: 'white', fontWeight: '600', fontSize: 12 },
})

export default Admin
