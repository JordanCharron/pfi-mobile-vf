// Session de l'utilisateur connecté.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

let utilisateur = null;
let favoris = []; // tableau des id de favoris

// Restaure favoris + user depuis localStorage (web uniquement)
if (isWeb) {
  try { favoris     = JSON.parse(localStorage.getItem('favoris')) || []; }   catch {}
  try { utilisateur = JSON.parse(localStorage.getItem('user'))    || null; } catch {}
}

function persisterFavoris() {
  if (!isWeb) return;
  try { localStorage.setItem('favoris', JSON.stringify(favoris)); } catch {}
}

export function getFavoris() {
  return favoris;
}

export function estFavori(id) {
  return favoris.includes(id);
}

export function basculerFavori(id) {
  if (favoris.includes(id)) favoris = favoris.filter(f => f !== id);
  else                      favoris = [...favoris, id];
  persisterFavoris();
}

function persisterUser() {
  if (!isWeb) return;
  try {
    if (utilisateur) localStorage.setItem('user', JSON.stringify(utilisateur));
    else             localStorage.removeItem('user');
  } catch {}
}

export function setUtilisateur(user) {
  utilisateur = user;
  persisterUser();
  if (user) {
    //chercher user dans securestore
    SecureStore.setItemAsync('lastUser', JSON.stringify(user)).catch(() => {});
  }
}

export function getUtilisateur() {
  return utilisateur;
}

export function deconnecter() {
  utilisateur = null;
  forfaitEnAttente = null;
  persisterUser();
  //delete user de secure store
  SecureStore.deleteItemAsync('lastUser').catch(() => {});
}

// Forfait sélectionné dans steppert
let forfaitEnAttente = null; 

export function setForfaitEnAttente(forfait) {
  forfaitEnAttente = forfait;
}

export function getForfaitEnAttente() {
  return forfaitEnAttente;
}

export function effacerForfaitEnAttente() {
  forfaitEnAttente = null;
}
