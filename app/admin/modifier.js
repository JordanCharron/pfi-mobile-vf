import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { getProduits, modifierProduit } from '../../db/database';
import EnTete from '../../composants/EnTete';
import { commun } from '../../composants/styles';
import t from '../../i18n';

const SOUS_CATEGORIES = {
  Cellulaire: ['iPhone', 'Samsung', 'Google', 'OnePlus', 'Nothing'],
  Accessoire: ['Chargeur', 'Écouteurs', 'Batterie externe', 'Coque', 'Câble'],
};

export default function Modifier() {
  const { id } = useLocalSearchParams();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [image, setImage] = useState('');
  const [categorie, setCategorie] = useState('Cellulaire');
  const [sousCategorie, setSousCategorie] = useState('iPhone');

  useEffect(() => {
    charger();
  }, []);

  function charger() {
    getProduits().then(produits => {
      const produit = produits.find(p => p.id === Number(id));
      if (produit) {
        setNom(produit.nom);
        setDescription(produit.description || '');
        setPrix(produit.prix);
        setImage(produit.image || '');
        const cat = produit.categorie || 'Cellulaire';
        setCategorie(cat);
        setSousCategorie(produit.sous_categorie || SOUS_CATEGORIES[cat][0]);
      }
    });
  }

  function changerCategorie(val) {
    setCategorie(val);
    setSousCategorie(SOUS_CATEGORIES[val][0]);
  }

  function sauvegarder() {
    if (!nom || !prix) {
      Alert.alert(t('erreur'), t('champsObligatoires'));
      return;
    }
    modifierProduit(id, nom, description, prix, image, categorie, sousCategorie)
      .then(() => {
        Alert.alert(t('succes'), t('produitModifie'));
        router.back();
      });
  }

  return (
    <SafeAreaView style={styles.root}>
      <EnTete titre={t('panneauAdmin')} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.retour}>{t('retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>{t('modifier')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {image ? (
          <Image source={{ uri: image }} style={styles.apercu} />
        ) : (
          <View style={styles.apercuVide}>
            <Text style={styles.apercuVideTxt}>—</Text>
          </View>
        )}

        <Text style={styles.label}>{t('nom')} *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Ex: iPhone 16" />

        <Text style={styles.label}>{t('description')}</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Ex: Apple • 128 Go" />

        <Text style={styles.label}>{t('prix')} *</Text>
        <TextInput style={styles.input} value={prix} onChangeText={setPrix} placeholder="Ex: 999 $" />

        <Text style={styles.label}>{t('urlImage')}</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." autoCapitalize="none" />

        <Text style={styles.label}>{t('categories')}</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={categorie}
            onValueChange={changerCategorie}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="black"
          >
            <Picker.Item label={t('cellulaire')} value="Cellulaire" color="black" />
            <Picker.Item label={t('accessoire')} value="Accessoire" color="black" />
          </Picker>
        </View>

        <Text style={styles.label}>{t('sousCategorie')}</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={sousCategorie}
            onValueChange={setSousCategorie}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="black"
          >
            {SOUS_CATEGORIES[categorie].map(sc => (
              <Picker.Item key={sc} label={sc} value={sc} color="black" />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.btn} onPress={sauvegarder}>
          <Text style={styles.btnTxt}>{t('enregistrer')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...commun,
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 16 },
  retour: { fontSize: 15, fontWeight: '600', color: 'black' },
  titre: { fontSize: 20, fontWeight: '800', color: 'black' },
  form: { paddingHorizontal: 20, paddingTop: 8, gap: 8 },
  apercu: { width: '100%', height: 200, borderRadius: 14, resizeMode: 'cover', marginBottom: 8 },
  apercuVide: { width: '100%', height: 200, borderRadius: 14, backgroundColor: 'gainsboro', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  apercuVideTxt: { color: 'darkgray', fontSize: 14 },
  pickerBox: { backgroundColor: 'white', borderWidth: 1, borderColor: 'gainsboro', borderRadius: 10, overflow: 'hidden', justifyContent: 'center' },
  picker: { height: 56, color: 'black' },
  btn: { backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  btnTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
});
