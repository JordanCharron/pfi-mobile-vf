import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { getUtilisateur } from '../utils/session';
// ascii fleches alt 26 alt 27
const textes = {
  fr: {
    // NavBar
    accueil:  'Accueil',
    produits: 'Produits',
    panier:   'Panier',
    compte:   'Compte',

    // Login
    connecter:    'Se connecter',
    nomUtilisateur: "Nom d'utilisateur",
    motDePasse:   'Mot de passe',

    // Accueil
    bonjour:      'Bonjour',
    categories:   'Catégories',
    tousLesProduits: 'Voir tous les produits →',
    nouveaute:    'Nouveauté',
    rachat:       'Rachat de cellulaire',
    vendezAppareil: 'Vendez votre ancien téléphone',
    evaluerAppareil: 'Évaluer mon appareil',
    rachatDesc:   "Recevez jusqu'à 200 $ de crédit",
    rachatStep1:  'Ouvrez le panier',
    rachatStep2:  'Choisissez votre marque',
    rachatStep3:  'Crédit appliqué',

    // Produits
    tous:       'Tous',
    cellulaire: 'Cellulaire',
    accessoire: 'Accessoire',
    toutes:     'Toutes',
    ajouterPanier: 'Ajouter au panier',
    chargement: 'Chargement...',
    retour:     '← Retour',
    allerPanier: 'Aller au panier →',

    // Stepper
    configuration: 'Configuration',
    forfait:       'Forfait',
    options:       'Options',
    recapitulatif: 'Récapitulatif',
    capacite:      'Capacité',
    couleur:       'Couleur',
    inclus:        'Inclus',
    suivant:       'Suivant →',
    precedent:     '← Précédent',
    choisirForfait: 'Choisir un forfait',
    aucunForfait:  'Aucun forfait',
    gratuit:       'Gratuit',
    parMois:       '/mois',
    appelsInter:   'Appels internationaux',
    appelsInterDesc:'+10 $/mois appels vers 50 pays',
    totalMensuel:  'Total mensuel',
    protectionApplecare: 'Protection AppleCare+',
    aucuneProtection: 'Aucune protection',
    duree:         'Durée',
    accessoiresSuggeres: 'Accessoires suggérés',
    votreCommande: 'Votre commande',
    telephone:     'Téléphone',
    modele:        'Modèle',
    prix:          'Prix',
    plusCapacite:  '+ Capacité',
    protection:    'Protection',
    accessoires:   'Accessoires',
    coutInitial:   'Coût initial',
    forfaitMobile: 'Forfait mobile',
    mensualite:    'Mensualité',

    // Panier
    panierVide:   'Votre panier est vide',
    unite:        'unité',
    total:        'Total',
    vider:        'Vider',
    acheter:      'Acheter',
    commandeConfirmee: 'Commande confirmée',
    totalPaye:    'Total payé',
    fermer:       'Fermer',
    continuer:    'Continuer →',
    forfaitActiveApresAchat: 'sera activé après le paiement',

    // Compte
    nomLectureSeule: 'Nom (lecture seule)',
    adresse:      'Adresse',
    courriel:     'Courriel',
    langue:       'Langue',
    enregistrer:  'Enregistrer',
    voirEntrepots:'Voir les entrepôts',
    mesFavoris:   '★ Mes favoris',
    deconnexion:  'Se déconnecter',
    profilMisAJour: 'Profil mis à jour',
    adresseNonReconnueTitre: 'Adresse non reconnue',
    adresseNonReconnueMsg: "Impossible de localiser cette adresse",
    rechercheAdresse: 'Recherche...',
    aucuneAdresseTrouvee: 'Aucune adresse trouvée',
    monForfait:   'Mon plan',

    // Forfait / Factures
    actif:           'Actif',
    dataIllimite:    'Données illimité',
    appelsIllimites: 'Appels illimités',
    changer:         'Changer',
    annuler:         'Annuler',
    confirmer:       'Confirmer',
    aucunAbonnement: 'Aucun abonnement actif',
    voirTelephones:  'Voir les téléphones',
    annulerAbonnement: 'Annuler votre abonnement ?',
    changerForfaitTitre: 'Changer de forfait',
    choisirNouveauForfait:'Choisir un nouveau forfait',
    mesGaranties: 'Mes garanties',
    garantieValide: 'Valide',
    garantieExpiree: 'Expirée',
    valideJusqu: "Valide jusqu'au",
    achetee: 'Achetée le',
    aucuneGarantie: 'Aucune garantie active',

    // Admin
    panneauAdmin:  'Panneau Admin',
    utilisateurs:  'Utilisateurs',
    commandes:     'Commandes',
    ajouterProduit: '+ Ajouter un produit',
    ajouterUtilisateur: '+ Ajouter un utilisateur',
    ajouterEntrepot: '+ Ajouter un entrepôt',
    nouvelUtilisateur: 'Nouvel utilisateur',
    nouvelEntrepot:    'Nouvel entrepôt',
    modifier:      'Modifier',
    supprimer:     'Supprimer',
    rendreAdmin:   'Rendre admin',
    retirerAdmin:  'Retirer admin',
    donnerAdmin:   'Donner le rôle admin',
    videConserver: '(vide = conserver)',
    nom:           'Nom',
    description:   'Description',
    urlImage:      "URL de l'image",
    sousCategorie: 'Sous-catégorie',
    aucunUtilisateur: 'Aucun utilisateur',
    aucuneCommande:'Aucune commande',
    aucunEntrepot: 'Aucun entrepôt',
    nomObligatoire:'Le nom est obligatoire',
    mdpObligatoire:'Le mot de passe est obligatoire',
    erreur:        'Erreur',
    succes:        'Succès',
    produitAjoute: 'Produit ajouté',
    produitModifie:'Produit modifié',
    confirmerSuppression: 'Confirmer la suppression',
    latitude:      'Latitude',
    longitude:     'Longitude',
    champsObligatoires: 'Tous les champs sont obligatoires',
    badgeAdmin:    'ADMIN',
    badgeVous:     'VOUS',

    // Entrepôts
    entrepotsTitre:'Entrepôts',
    lePlusProche:  'Le plus proche',
    km:            'km',
  },

  en: {
    // NavBar
    accueil:  'Home',
    produits: 'Products',
    panier:   'Cart',
    compte:   'Account',

    // Login
    connecter:    'Sign in',
    nomUtilisateur: 'Username',
    motDePasse:   'Password',

    // Accueil
    bonjour:      'Hello',
    categories:   'Categories',
    tousLesProduits: 'View all products →',
    nouveaute:    'New arrival',
    rachat:       'Phone buyback',
    vendezAppareil: 'Sell your old phone',
    evaluerAppareil: 'Get a quote',
    rachatDesc:   "Get up to $200 credit",
    rachatStep1:  'Open the cart',
    rachatStep2:  'Choose your brand',
    rachatStep3:  'Credit applied',

    // Produits
    tous:       'All',
    cellulaire: 'Phones',
    accessoire: 'Accessories',
    toutes:     'All',
    ajouterPanier: 'Add to cart',
    chargement: 'Loading...',
    retour:     '← Back',
    allerPanier: 'Go to cart →',

    // Stepper
    configuration: 'Configuration',
    forfait:       'Plan',
    options:       'Options',
    recapitulatif: 'Summary',
    capacite:      'Capacity',
    couleur:       'Color',
    inclus:        'Included',
    suivant:       'Next →',
    precedent:     '← Previous',
    choisirForfait: 'Choose a plan',
    aucunForfait:  'No plan',
    gratuit:       'Free',
    parMois:       '/month',
    appelsInter:   'International calls',
    appelsInterDesc:'+$10/month — calls to 50 countries',
    totalMensuel:  'Monthly total',
    protectionApplecare: 'AppleCare+ protection',
    aucuneProtection: 'No protection',
    duree:         'Duration',
    accessoiresSuggeres: 'Suggested accessories',
    votreCommande: 'Your order',
    telephone:     'Phone',
    modele:        'Model',
    prix:          'Price',
    plusCapacite:  '+ Capacity',
    protection:    'Protection',
    accessoires:   'Accessories',
    coutInitial:   'Initial cost',
    forfaitMobile: 'Mobile plan',
    mensualite:    'Monthly',

    // Panier
    panierVide:   'Your cart is empty',
    unite:        'unit',
    total:        'Total',
    vider:        'Clear',
    acheter:      'Buy',
    commandeConfirmee: 'Order confirmed',
    totalPaye:    'Total paid',
    fermer:       'Close',
    continuer:    'Continue →',
    forfaitActiveApresAchat: 'will be activated after purchase',

    // Compte
    nomLectureSeule: 'Name (read only)',
    adresse:      'Address',
    courriel:     'Email',
    langue:       'Language',
    enregistrer:  'Save',
    voirEntrepots:'View warehouses',
    mesFavoris:   'My favorites',
    deconnexion:  'Sign out',
    profilMisAJour: 'Profile updated',
    adresseNonReconnueTitre: 'Address not recognized',
    adresseNonReconnueMsg: "Could not locate this address",
    rechercheAdresse: 'Searching...',
    aucuneAdresseTrouvee: 'No address found.',
    monForfait:   'My plan',

    // Forfait / Factures
    actif:           'Active',
    dataIllimite:    'Unlimited data',
    appelsIllimites: 'Unlimited calls',
    changer:         'Change',
    annuler:         'Cancel',
    confirmer:       'Confirm',
    aucunAbonnement: 'No active subscription',
    voirTelephones:  'View phones',
    annulerAbonnement: 'Cancel your subscription?',
    changerForfaitTitre: 'Change plan',
    choisirNouveauForfait:'Choose a new plan',
    mesGaranties: 'My warranties',
    garantieValide: 'Valid',
    garantieExpiree: 'Expired',
    valideJusqu: 'Valid until',
    achetee: 'Purchased on',
    aucuneGarantie: 'No active warranty',

    // Admin
    panneauAdmin:  'Admin Panel',
    utilisateurs:  'Users',
    commandes:     'Orders',
    ajouterProduit: '+ Add a product',
    ajouterUtilisateur: '+ Add a user',
    ajouterEntrepot: '+ Add a warehouse',
    nouvelUtilisateur: 'New user',
    nouvelEntrepot:    'New warehouse',
    modifier:      'Edit',
    supprimer:     'Delete',
    rendreAdmin:   'Make admin',
    retirerAdmin:  'Remove admin',
    donnerAdmin:   'Grant admin role',
    videConserver: '(empty = keep)',
    nom:           'Name',
    description:   'Description',
    urlImage:      'Image URL',
    sousCategorie: 'Sub-category',
    aucunUtilisateur: 'No user',
    aucuneCommande:'No order',
    aucunEntrepot: 'No warehouse',
    nomObligatoire:'Name is required',
    mdpObligatoire:'Password is required',
    erreur:        'Error',
    succes:        'Success',
    produitAjoute: 'Product added',
    produitModifie:'Product updated',
    confirmerSuppression: 'Confirm deletion',
    latitude:      'Latitude',
    longitude:     'Longitude',
    champsObligatoires: 'All fields are required',
    badgeAdmin:    'ADMIN',
    badgeVous:     'YOU',

    // Entrepôts
    entrepotsTitre:'Warehouses',
    lePlusProche:  'Closest',
    km:            'km',
  },
};


const i18n = new I18n(textes);
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

function langueCourante() {
  const user = getUtilisateur();
  let langue = user && user.langue_prefere || 'auto';
  if (langue === 'auto') {
    const premier = getLocales()[0];
    const locale = premier && premier.languageCode || 'fr';
    langue = locale === 'fr' ? 'fr' : 'en';
  }
  return langue;
}

export default function t(cle) {
  i18n.locale = langueCourante();
  return i18n.t(cle);
}

const formatterArgentFR = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const formatterArgentEN = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

export function formatPrix(montant) {
  const n = typeof montant === 'number'
    ? montant
    : parseFloat(String(montant).replace(/[^0-9\-]/g, '')) || 0;
  if (langueCourante() === 'fr') return formatterArgentFR.format(n);
  return formatterArgentEN.format(n);
}
