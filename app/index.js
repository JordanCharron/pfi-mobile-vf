import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import * as Haptics from 'expo-haptics'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { connexion, getAbonnementActif } from '../db/database'
import { setUtilisateur } from '../utils/session'
import { commun } from '../composants/styles'


// enregistrer le password https://docs.expo.dev/versions/latest/sdk/securestore/
const Login = () => {
  const [nom, setNom] = useState('')
  const [mdp, setMdp] = useState('')
  const [biometricDispo, setBiometricDispo] = useState(false)
  const [lastUser, setLastUser] = useState(null)

  useEffect(() => {
    Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      SecureStore.getItemAsync('lastUser'),
    ])
      .then(([hasHardware, enrolled, stored]) => {
        if (hasHardware && enrolled && stored) {
          setBiometricDispo(true)
          setLastUser(JSON.parse(stored))
        }
      })
      .catch(() => {})
  }, [])

  const erreur = (msg) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    Alert.alert('Erreur', msg)
  }

  const allerVersAccueil = async (user) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setUtilisateur(user)
    if (user.admin) router.replace('/admin')
    else {
      const abo = await getAbonnementActif(user.id)
      router.replace(abo ? '/forfait' : '/accueil')
    }
  }

  const seConnecter = async () => {
    if (!nom || !mdp) return erreur('Veuillez remplir tous les champs')
    const user = await connexion(nom, mdp)
    if (!user) return erreur('Nom ou mot de passe incorrect')
    try { await SecureStore.setItemAsync('lastUser', JSON.stringify(user)) } catch {}
    allerVersAccueil(user)
  }

  const seConnecterBiometrique = async () => {
    if (!lastUser) return
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Se connecter en tant que ' + lastUser.nom,
      cancelLabel: 'Annuler',
    })
    if (result.success) allerVersAccueil(lastUser)
    else                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logoImg} />
        <Text style={styles.logo}>NovaTel</Text>
        <Text style={styles.sous}>Connectez-vous pour continuer</Text>

        <TextInput style={styles.input} placeholder="Nom d'utilisateur" value={nom} onChangeText={setNom} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe" value={mdp} onChangeText={setMdp} secureTextEntry autoCapitalize="none" />

        <TouchableOpacity onPress={seConnecter} activeOpacity={0.8}>
          <View style={styles.btn}>
            <Text style={styles.btnTxt}>Se connecter</Text>
          </View>
        </TouchableOpacity>

        {biometricDispo && (
          <TouchableOpacity style={styles.btnBio} onPress={seConnecterBiometrique} activeOpacity={0.8}>
            <FontAwesome name="lock" size={16} color="dodgerblue" style={{ marginRight: 8 }} />
            <Text style={styles.btnBioTxt}>Face ID / empreinte</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.noms}>Jordan Charron & Claudio Cisneros</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  ...commun,
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 12 },
  logoImg: { width: 130, height: 180, resizeMode: 'contain', alignSelf: 'center', marginBottom: 8 },
  logo: { fontSize: 32, fontWeight: '800', color: 'black', textAlign: 'center' },
  sous: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 8 },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, backgroundColor: 'dodgerblue' },
  btnTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
  btnBio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: 'dodgerblue', marginTop: 8 },
  btnBioTxt: { color: 'dodgerblue', fontWeight: '700', fontSize: 14 },
  noms: { textAlign: 'center', color: 'darkgray', fontSize: 12, paddingBottom: 16 },
})

export default Login
