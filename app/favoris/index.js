import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getProduits } from '../../db/database';
import { getFavoris, basculerFavori } from '../../utils/session';
import NavBar from '../../composants/NavBar';
import EnTete from '../../composants/EnTete';

export default function Favoris() {
  const [produits, setProduits] = useState([]);
  const [favTick, setFavTick] = useState(0);

  useEffect(() => {
    getProduits().then(setProduits);
  }, [favTick]);

  function retirer(id) {
    basculerFavori(id);
    setFavTick(t => t + 1);
  }

  const favoris = getFavoris();
  const liste = produits.filter(p => favoris.includes(p.id));

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre="Mes favoris" />

      {liste.length === 0 ? (
        <View style={styles.vide}>
          <FontAwesome name="star" size={60} color="blue" />
          <Text style={styles.videTexte}>Aucun favori pour le moment</Text>
        </View>
      ) : (
        <FlatList
          data={liste}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.item} onPress={() => router.push({ pathname: '/produits/[id]', params: { id: item.id } })}>
              <Image source={{ uri: item.image }} style={styles.miniature} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nom}>{item.nom}</Text>
                <Text style={styles.prix}>{item.prix}</Text>
              </View>
              {/*hitslop pour aggrandir la zone cliquable pce étoile trop petite*/}
              <TouchableOpacity onPress={() => retirer(item.id)} hitSlop={10}>
                <FontAwesome name="star" size={20} color="orange" />
              </TouchableOpacity>
            </Pressable>
          )}
        />
      )}

      <NavBar actif="compte" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: 'whitesmoke', paddingTop: 30 },
  vide:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  videTexte:  { fontSize: 16, color: 'gray', fontWeight: '600' },
  videSous:   { fontSize: 13, color: 'darkgray', textAlign: 'center' },
  item:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, gap: 14, borderWidth: 1, borderColor: 'gainsboro' },
  miniature:  { width: 60, height: 60, borderRadius: 8, resizeMode: 'cover' },
  nom:        { fontSize: 15, fontWeight: '600', color: 'black' },
  prix:       { fontSize: 13, color: 'gray', marginTop: 2 },
});
