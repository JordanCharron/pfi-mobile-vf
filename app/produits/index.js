import { useState, useEffect } from 'react'
import { View, Text, FlatList, Pressable, Image, TouchableOpacity, TextInput, RefreshControl, StyleSheet, SafeAreaView } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { router, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { getProduits } from '../../db/database'
import { basculerFavori, estFavori } from '../../utils/session'
import NavBar from '../../composants/NavBar'
import EnTete from '../../composants/EnTete'
import t from '../../i18n'

const CATEGORIES = ['Tous', 'Cellulaire', 'Accessoire']

const SOUS_CATS = {
  Tous:       ['Toutes'],
  Cellulaire: ['Toutes', 'iPhone', 'Samsung', 'Google', 'OnePlus', 'Nothing'],
  Accessoire: ['Toutes', 'Chargeur', 'Écouteurs', 'Batterie externe', 'Coque', 'Câble'],
}

const Produits = () => {
  const params = useLocalSearchParams()
  const [produits, setProduits] = useState([])
  const [categorie, setCategorie] = useState(params.cat || 'Tous')
  const [sousCat, setSousCat] = useState('Toutes')
  const [recherche, setRecherche] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [favTick, setFavTick] = useState(0)

  useEffect(() => {
    getProduits().then(setProduits)
  }, [])

  useEffect(() => {
    setCategorie(params.cat || 'Tous')
    setSousCat('Toutes')
  }, [params.cat])

  const rafraichir = async () => {
    setRefreshing(true)
    setProduits(await getProduits())
    setRefreshing(false)
  }

  const changerCategorie = (cat) => {
    setCategorie(cat)
    setSousCat('Toutes')
  }

  const toggleFavori = (id) => {
    basculerFavori(id)
    setFavTick(t => t + 1)
  }

  const compterCategorie = (cat) => {
    if (cat === 'Tous') return produits.length
    return produits.filter(p => p.categorie === cat).length
  }

  //filtre les produits avec les filtres ou la recherche
  const produitsFiltres = produits.filter(p => {
    const matchCat  = categorie === 'Tous'   || p.categorie     === categorie
    const matchSous = sousCat   === 'Toutes' || p.sous_categorie === sousCat
    const matchRech = !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSous && matchRech
  })

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('produits')} />
      {/*barre de recherche*/}
      <View style={styles.rechercheWrap}>
        <FontAwesome name="search" size={14} color="gray" />
        <TextInput
          style={styles.rechercheInput}
          placeholder="Rechercher un produit..."
          value={recherche}
          onChangeText={setRecherche}
          autoCapitalize="none"
        />
        {/* delete la recherche*/}
        {recherche ? (
          <TouchableOpacity onPress={() => setRecherche('')}>
            <FontAwesome name="times-circle" size={16} color="gray" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filtres}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filtreBtn, categorie === cat && styles.filtreBtnActif]}
            onPress={() => changerCategorie(cat)}
          >
            <Text style={[styles.filtreTxt, categorie === cat && styles.filtreTxtActif]}>
              {cat} ({compterCategorie(cat)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {SOUS_CATS[categorie].length > 1 && (
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={sousCat}
            onValueChange={setSousCat}
            style={{ height: 56, color: 'black' }}
            mode="dropdown"
            dropdownIconColor="black"
          >
            {SOUS_CATS[categorie].map(s => <Picker.Item key={s} label={s} value={s} color="black" />)}
          </Picker>
        </View>
      )}

      <FlatList
        data={produitsFiltres}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={rafraichir} />}
        extraData={favTick}
        renderItem={({ item }) => {
          const fav = estFavori(item.id)
          return (
            <Pressable style={styles.item} onPress={() => router.push({ pathname: '/produits/[id]', params: { id: item.id } })}>
              <Image source={{ uri: item.image }} style={styles.miniature} />
              <Text style={styles.nom}>{item.nom}</Text>
              <TouchableOpacity onPress={() => toggleFavori(item.id)} hitSlop={10}>
                <FontAwesome name={fav ? 'star' : 'star-o'} size={20} color={fav ? '#f5a623' : '#bbb'} />
              </TouchableOpacity>
            </Pressable>
          )
        }}
      />

      <NavBar actif="produits" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  rechercheWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: 'gainsboro', paddingHorizontal: 12, paddingVertical: 8 },
  rechercheInput: { flex: 1, fontSize: 14, color: 'black' },
  filtres: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  filtreBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro' },
  filtreBtnActif: { backgroundColor: 'black' },
  filtreTxt: { fontSize: 13, color: 'gray' },
  filtreTxtActif: { color: 'white', fontWeight: '600' },
  pickerWrap: { marginHorizontal: 16, marginTop: 8, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: 'gainsboro' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, gap: 14, borderWidth: 1, borderColor: 'gainsboro' },
  miniature: { width: 60, height: 60, borderRadius: 8, resizeMode: 'cover' },
  nom: { flex: 1, fontSize: 15, fontWeight: '600', color: 'black' },
})

export default Produits
