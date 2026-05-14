import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import entrepotsSeed from '../data/entrepots.json';

// sqlite marche pas sur le web fait que je check
const isWeb = Platform.OS === 'web';

// les forfaits possible
export const FORFAITS = [
  { id: 'aucun',     nom: 'Aucun forfait',  data: '—',         appels: '—',                 mensuel: 0,  dataLimite: 0,    minutesLimite: 0    },
  { id: 'essentiel', nom: 'Essentiel',      data: '5 Go',      appels: 'Canada',            mensuel: 35, dataLimite: 5,    minutesLimite: 500  },
  { id: 'standard',  nom: 'Standard',       data: '25 Go',     appels: 'Canada · USA',      mensuel: 55, dataLimite: 25,   minutesLimite: 1500 },
  { id: 'premium',   nom: 'Premium',        data: 'Illimité',  appels: 'Illimité partout',  mensuel: 85, dataLimite: null, minutesLimite: null },
];

let db;

// les produits que je met dans la db au demarrage
let PRODUITS = [
  { id: 1,  nom: 'iPhone 16 Pro',            description: 'Apple  Titane', prix: '1 299 $', image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSKqB4z_k62FcWuhr1XoGdI5YurQPH3HP9kDIWqwDdW8f0ju6SosI9B4gKXanYT0JU10ytbNlonDw3xQ_1f376zvIFCAhvB',  categorie: 'Cellulaire',  sous_categorie: 'iPhone'   },
  { id: 2,  nom: 'iPhone 15 Pro Max',        description: 'Apple Titane noir', prix: '1 599 $', image: 'https://shop.mobileklinik.ca/cdn/shop/files/iPhone15Pro-Blue-500px.png?v=1744073361&width=500',  categorie: 'Cellulaire',  sous_categorie: 'iPhone'   },
  { id: 3,  nom: 'iPhone 15',                description: 'Apple', prix: '999 $', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-iphone-15-blue-202412?wid=4000&hei=4000&fmt=jpeg&qlt=90&.v=1731694787476',  categorie: 'Cellulaire',  sous_categorie: 'iPhone'   },
  { id: 4,  nom: 'Samsung Galaxy S25 Ultra', description: 'Samsung  Phantom Black', prix: '1 199 $', image: 'https://multimedia.bbycastatic.ca/multimedia/products/500x500/189/18925/18925581.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Samsung'  },
  { id: 5,  nom: 'Samsung Galaxy S24 Ultra', description: 'Samsung  Titanium Gray', prix: '1 529 $', image: 'https://m.media-amazon.com/images/I/61Z+OYjhOoL._AC_UF894,1000_QL80_.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Samsung'  },
  { id: 6,  nom: 'Samsung Galaxy A55 5G',    description: 'Samsung  Iceblue', prix: '540 $', image: 'https://ecomlisters.s3.amazonaws.com/1812184111/1812184111_B0CXMD4N8R_1722083508641.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Samsung'  },
  { id: 7,  nom: 'Google Pixel 9 Pro',       description: 'Google Obsidian',  prix: '999 $', image: 'https://swiftronics.ca/cdn/shop/files/black_457db7cebb5b418bb7bd62c85d39e8c4_master.webp?v=1755830726',  categorie: 'Cellulaire',  sous_categorie: 'Google'   },
  { id: 8,  nom: 'Google Pixel 8 Pro',       description: 'Google Obsidian',  prix: '1 099 $',image: 'https://m.media-amazon.com/images/I/71XEjCc4yLL.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Google'   },
  { id: 9,  nom: 'Google Pixel 8a',          description: 'Google Aloe', prix: '679 $',   image: 'https://m.media-amazon.com/images/I/71n1Bn04lJL._AC_UF894,1000_QL80_.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Google'   },
  { id: 10, nom: 'OnePlus 13',               description: 'OnePlus Midnight',  prix: '849 $', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqUhgCcjU5aC-yQcbPpIYRSQ1Kiuvaf_AUNQ&s',  categorie: 'Cellulaire',  sous_categorie: 'OnePlus'  },
  { id: 11, nom: 'Nothing Phone (2a)',       description: 'Nothing Black',  prix: '450 $', image: 'https://m.media-amazon.com/images/I/519KVc-h8xL._UF1000,1000_QL80_.jpg',  categorie: 'Cellulaire',  sous_categorie: 'Nothing'         },

  // Accessoires 
  // Chargeurs
  { id: 12, nom: 'Apple MagSafe 15W',                description: 'Chargeur magnétique sans fil',    prix: '45 $',    image: 'https://www.baka.ca/content/images/accessories/apple-oem-magsafe-wireless-charger-15w--white--01_product_photo.jpg?v1',  categorie: 'Accessoire',  sous_categorie: 'Chargeur'        },
  { id: 13, nom: 'Samsung 45W Super Fast',           description: 'Chargeur USB-C', prix: '50 $',    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb4K9xgY-842ctrDDngeRR2ttwnylV-PdF_A&s',  categorie: 'Accessoire',  sous_categorie: 'Chargeur'        },

  //Écouteurs
  { id: 14, nom: 'AirPods Pro 2e génération',        description: 'Apple ANC Bluetooth 5.4 USB-C', prix: '329 $', image: 'https://www.bureauengros.com/cdn/shop/products/650b1e356ffd7ade6595cf09ef5299511ae7a657_square3038413_1_84873513-2f4d-4ebd-9b82-df577bfd2001_1000x.jpg?v=1774268146',  categorie: 'Accessoire',  sous_categorie: 'Écouteurs'       },
  { id: 15, nom: 'Samsung Galaxy Buds3 Pro',         description: 'Samsung ANC Bluetooth 5.4 USB-C', prix: '199 $', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLwg7iZX2AGHwroqxrssQ2K2alxQd8hv05Sw&s',  categorie: 'Accessoire',  sous_categorie: 'Écouteurs'       },

  // Batterie pack
  { id: 16, nom: 'Anker PowerCore 20000',            description: 'Anker 20 000 mAh USB-C + USB-A',  prix: '75 $', image: 'https://m.media-amazon.com/images/I/71Rld5s-V1L.jpg',  categorie: 'Accessoire',  sous_categorie: 'Batterie externe'},
  { id: 17, nom: 'Belkin BoostCharge Pro 10K',       description: 'Belkin 10 000 mAh MagSafe 15W', prix: '89 $', image: 'https://m.media-amazon.com/images/I/515fLdCy58L.jpg',  categorie: 'Accessoire',  sous_categorie: 'Batterie externe'},

  // cases
  { id: 18, nom: 'Apple Coque MagSafe iPhone 16 Pro',description: 'Apple Silicone Bleu', prix: '65 $', image: 'https://m.media-amazon.com/images/I/61HT+fMtgoL._AC_UF350,350_QL80_.jpg',  categorie: 'Accessoire',  sous_categorie: 'Coque'           },
  { id: 19, nom: 'Spigen Ultra Hybrid S25 Ultra',    description: 'Spigen Transparent Anti-jaunissement', prix: '22 $', image: 'https://www.spigen.com/cdn/shop/files/detail_sp691_ultra_hybrid_magfit_neoone_08.jpg?v=1735849366&width=1946',  categorie: 'Accessoire',  sous_categorie: 'Coque'           },

  // cables
  { id: 20, nom: 'Apple Câble USB-C tressé 1m',      description: 'Apple USB-C vers USB-C 60W', prix: '35 $', image: 'https://m.media-amazon.com/images/I/51U44bhAicL._AC_UF894,1000_QL80_.jpg',  categorie: 'Accessoire',  sous_categorie: 'Câble'           },
  { id: 21, nom: 'Anker Câble USB-C 240W 1.8m',      description: 'Anker USB-C vers USB-C Nylon', prix: '18 $', image: 'https://cdn.shopify.com/s/files/1/0493/7636/2660/files/A88E2011_Richimage_nocopy_2000x2000px_29105b88-b02b-4db3-8bc7-a1922c1dc75f.png?v=1763517239',  categorie: 'Accessoire',  sous_categorie: 'Câble'           },
];

function openDB() {
  if (!db) db = SQLite.openDatabaseSync('nova_phone.db');
  return db;
}

// pour pas refaire l'init des tables chaque fois
let initFait = false;

async function getDB() {
  if (!isWeb && !initFait) {
    initFait = true;
    await doInit();
  }
  return openDB();
}

export async function initDB() {
  if (!isWeb && !initFait) {
    initFait = true;
    await doInit();
  }
}

// cree les tables si elles existent pas
async function doInit() {
  const db = openDB();

  await db.execAsync(`CREATE TABLE IF NOT EXISTS produit (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nom             TEXT    NOT NULL UNIQUE,
    description     TEXT,
    prix            TEXT    NOT NULL,
    image           TEXT,
    categorie       TEXT,
    sous_categorie  TEXT
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS client (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nom             TEXT    NOT NULL UNIQUE,
    mdp             TEXT    NOT NULL,
    admin           INTEGER NOT NULL DEFAULT 0,
    adresse         TEXT,
    courriel        TEXT,
    langue_prefere  TEXT    NOT NULL DEFAULT 'fr',
    latitude        REAL,
    longitude       REAL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS panier (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    produit_id INTEGER NOT NULL,
    nom        TEXT    NOT NULL,
    prix       TEXT    NOT NULL,
    image      TEXT,
    quantite   INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (produit_id) REFERENCES produit(id)
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS entrepot (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nom       TEXT    NOT NULL,
    adresse   TEXT    NOT NULL,
    latitude  REAL    NOT NULL,
    longitude REAL    NOT NULL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS commande (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER,
    client_nom  TEXT    NOT NULL,
    total       REAL    NOT NULL,
    date        TEXT    NOT NULL,
    items_json  TEXT    NOT NULL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS abonnement (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id                INTEGER NOT NULL,
    forfait_id               TEXT    NOT NULL,
    forfait_nom              TEXT    NOT NULL,
    forfait_mensuel          REAL    NOT NULL,
    forfait_data_inclus      REAL,
    forfait_minutes_inclus   INTEGER,
    appels_internationaux    INTEGER NOT NULL DEFAULT 0,
    date_debut               TEXT    NOT NULL,
    statut                   TEXT    NOT NULL DEFAULT 'actif'
  )`);

  // remplis la table produit
  for (const p of PRODUITS) {
    try {
      await db.runAsync(
        'INSERT OR IGNORE INTO produit (nom, description, prix, image, categorie, sous_categorie) VALUES (?, ?, ?, ?, ?, ?)',
        [p.nom, p.description, p.prix, p.image, p.categorie, p.sous_categorie]
      );
    } catch (err) {
      console.warn('erreur produit:', p.nom, err);
    }
  }

  // les entrepots viennent du fichier json
  for (const e of entrepotsSeed) {
    try {
      await db.runAsync(
        'INSERT OR IGNORE INTO entrepot (id, nom, adresse, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
        [e.id, e.nom, e.adresse, e.latitude, e.longitude]
      );
    } catch (err) {
      console.warn('erreur entrepot:', e.nom, err);
    }
  }

  // 2 users pour tester (1 admin + 1 normal)
  try {
    await db.runAsync(
      'INSERT OR IGNORE INTO client (nom, mdp, admin, adresse, courriel, langue_prefere) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'password', 1, '987 Rte Morin, Val-David, QC J0T 2N0', 'admin@novatel.ca', 'auto']
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO client (nom, mdp, admin, adresse, courriel, langue_prefere) VALUES (?, ?, ?, ?, ?, ?)',
      ['jordan', 'password', 0, '987 Rte Morin, Val-David, QC J0T 2N0', 'jocharron29@outlook.com', 'auto']
    );
  } catch (err) {
    console.warn('erreur client:', err);
  }
}

// produits 
export async function ajouterProduit(nom, description, prix, image, categorie, sous_categorie) {
  if (isWeb) {
    if (PRODUITS.some(p => p.nom === nom)) throw new Error('Nom de produit déjà utilisé');
    const newId = Math.max(...PRODUITS.map(p => p.id)) + 1;
    PRODUITS.push({ id: newId, nom, description, prix, image, categorie, sous_categorie });
    return;
  }
  const db = await getDB();
  try {
    await db.runAsync(
      'INSERT INTO produit (nom, description, prix, image, categorie, sous_categorie) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, description, prix, image, categorie, sous_categorie]
    );
  } catch (e) {
    // on ne peux pas utiliser 2x le meme nom
    throw new Error('Nom de produit déjà utilisé');
  }
}

export async function supprimerProduit(id) {
  if (isWeb) {
    PRODUITS = PRODUITS.filter(p => p.id != id);
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM produit WHERE id = ?', [id]);
}

export async function modifierProduit(id, nom, description, prix, image, categorie, sous_categorie) {
  if (isWeb) {
    const idx = PRODUITS.findIndex(p => p.id == id);
    if (idx !== -1) {
      PRODUITS[idx] = { ...PRODUITS[idx], nom, description, prix, image, categorie, sous_categorie };
    }
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'UPDATE produit SET nom = ?, description = ?, prix = ?, image = ?, categorie = ?, sous_categorie = ? WHERE id = ?',
    [nom, description, prix, image, categorie, sous_categorie, id]
  );
}

export async function getProduits() {
  if (isWeb) return [...PRODUITS];
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM produit');
}

// login profil
let CLIENTS_WEB_NEXT_ID = 4;
let CLIENTS_WEB = [
  { id: 1, nom: 'admin',  mdp: 'password', admin: 1, adresse: '1234 Rue Principale, Montréal', courriel: 'admin@novatel.ca',  langue_prefere: 'auto', latitude: null, longitude: null },
  { id: 2, nom: 'jordan', mdp: 'password', admin: 0, adresse: '290 rue corona, Rosemere',      courriel: 'jordan@novatel.ca', langue_prefere: 'auto', latitude: null, longitude: null },
  { id: 3, nom: 'user',   mdp: 'password', admin: 0, adresse: '1234 Rue Test, Montréal',       courriel: 'user@novatel.ca',   langue_prefere: 'auto', latitude: null, longitude: null }
];

export async function connexion(nom, mdp) {
  if (isWeb) return CLIENTS_WEB.find(c => c.nom === nom && c.mdp === mdp) || null;
  const db = await getDB();
  return await db.getFirstAsync(
    'SELECT * FROM client WHERE nom = ? AND mdp = ?',
    [nom, mdp]
  );
}

export async function modifierClient(id, adresse, mdp, langue, courriel, latitude = null, longitude = null) {
  if (isWeb) {
    const client = CLIENTS_WEB.find(c => c.id === id);
    if (client) {
      client.adresse = adresse;
      client.mdp = mdp;
      client.langue_prefere = langue;
      client.courriel = courriel;
      client.latitude = latitude;
      client.longitude = longitude;
    }
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'UPDATE client SET adresse = ?, mdp = ?, langue_prefere = ?, courriel = ?, latitude = ?, longitude = ? WHERE id = ?',
    [adresse, mdp, langue, courriel, latitude, longitude, id]
  );
}

export async function getClients() {
  if (isWeb) return [...CLIENTS_WEB];
  const db = await getDB();
  return await db.getAllAsync('SELECT id, nom, admin, adresse, courriel, langue_prefere FROM client ORDER BY id');
}

export async function ajouterClient(nom, mdp, admin, adresse, courriel) {
  if (isWeb) {
    if (CLIENTS_WEB.some(c => c.nom === nom)) throw new Error('Nom déjà utilisé');
    CLIENTS_WEB.push({
      id: CLIENTS_WEB_NEXT_ID++,
      nom,
      mdp,
      admin: admin ? 1 : 0,
      adresse,
      courriel,
      langue_prefere: 'auto',
    });
    return;
  }
  const db = await getDB();
  try {
    await db.runAsync(
      'INSERT INTO client (nom, mdp, admin, adresse, courriel, langue_prefere) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, mdp, admin ? 1 : 0, adresse, courriel, 'auto']
    );
  } catch (e) {
    throw new Error('Nom déjà utilisé');
  }
}

// quand l'admin modifie un user 
export async function modifierClientAdmin(id, nom, mdp, adresse, courriel) {
  if (isWeb) {
    const c = CLIENTS_WEB.find(c => c.id === id);
    if (!c) return;
    c.nom = nom;
    if (mdp) c.mdp = mdp;
    c.adresse = adresse;
    c.courriel = courriel;
    return;
  }
  const db = await getDB();
  if (mdp) {
    await db.runAsync('UPDATE client SET nom = ?, mdp = ?, adresse = ?, courriel = ? WHERE id = ?', [nom, mdp, adresse, courriel, id]);
  } else {
    await db.runAsync('UPDATE client SET nom = ?, adresse = ?, courriel = ? WHERE id = ?', [nom, adresse, courriel, id]);
  }
}

export async function supprimerClient(id) {
  if (isWeb) {
    CLIENTS_WEB = CLIENTS_WEB.filter(c => c.id !== id);
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM client WHERE id = ?', [id]);
}

export async function basculerAdmin(id) {
  if (isWeb) {
    const client = CLIENTS_WEB.find(c => c.id === id);
    if (client) client.admin = client.admin ? 0 : 1;
    return;
  }
  const db = await getDB();
  await db.runAsync('UPDATE client SET admin = CASE admin WHEN 1 THEN 0 ELSE 1 END WHERE id = ?', [id]);
}

// panier
let PANIER_WEB = [];
let panierNextId = 1;


export async function ajouterAuPanier(produit) {
  if (isWeb) {
    const existant = PANIER_WEB.find(p => p.nom === produit.nom);
    if (existant) {
      existant.quantite += 1;
    } else {
      PANIER_WEB.push({ id: panierNextId++, produit_id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, quantite: 1 });
    }
    return;
  }
  const db = await getDB();
  const existant = await db.getFirstAsync('SELECT * FROM panier WHERE nom = ?', [produit.nom]);
  if (existant) {
    await db.runAsync('UPDATE panier SET quantite = quantite + 1 WHERE nom = ?', [produit.nom]);
  } else {
    await db.runAsync(
      'INSERT INTO panier (produit_id, nom, prix, image, quantite) VALUES (?, ?, ?, ?, 1)',
      [Number(produit.id) || 0, produit.nom, produit.prix, produit.image]
    );
  }
}

export async function getPanier() {
  if (isWeb) return [...PANIER_WEB];
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM panier');
}

export async function retirerDuPanier(id) {
  if (isWeb) {
    PANIER_WEB = PANIER_WEB.filter(p => p.id !== id);
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM panier WHERE id = ?', [id]);
}

export async function viderPanier() {
  if (isWeb) {
    PANIER_WEB = [];
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM panier');
}

export async function modifierQuantite(id, quantite) {
  if (isWeb) {
    if (quantite <= 0) {
      PANIER_WEB = PANIER_WEB.filter(p => p.id !== id);
    } else {
      const item = PANIER_WEB.find(p => p.id === id);
      if (item) item.quantite = quantite;
    }
    return;
  }
  const db = await getDB();
  if (quantite <= 0) {
    await db.runAsync('DELETE FROM panier WHERE id = ?', [id]);
  } else {
    await db.runAsync('UPDATE panier SET quantite = ? WHERE id = ?', [quantite, id]);
  }
}

// entrepots
let ENTREPOTS_WEB = entrepotsSeed.map(e => ({ ...e }));
let ENTREPOTS_WEB_NEXT_ID = Math.max(...ENTREPOTS_WEB.map(e => e.id)) + 1;

export async function getEntrepots() {
  if (isWeb) return [...ENTREPOTS_WEB];
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM entrepot ORDER BY nom');
}

export async function ajouterEntrepot(nom, adresse, latitude, longitude) {
  if (isWeb) {
    ENTREPOTS_WEB.push({ id: ENTREPOTS_WEB_NEXT_ID++, nom, adresse, latitude, longitude });
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO entrepot (nom, adresse, latitude, longitude) VALUES (?, ?, ?, ?)',
    [nom, adresse, latitude, longitude]
  );
}

export async function modifierEntrepot(id, nom, adresse, latitude, longitude) {
  if (isWeb) {
    const idx = ENTREPOTS_WEB.findIndex(e => e.id === id);
    if (idx !== -1) ENTREPOTS_WEB[idx] = { id, nom, adresse, latitude, longitude };
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'UPDATE entrepot SET nom = ?, adresse = ?, latitude = ?, longitude = ? WHERE id = ?',
    [nom, adresse, latitude, longitude, id]
  );
}

export async function supprimerEntrepot(id) {
  if (isWeb) {
    ENTREPOTS_WEB = ENTREPOTS_WEB.filter(e => e.id !== id);
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM entrepot WHERE id = ?', [id]);
}

// commandes
let COMMANDES_WEB = [];
let COMMANDES_WEB_NEXT_ID = 1;

export async function passerCommande(client, items, total) {
  const date = new Date().toISOString();
  const itemsJson = JSON.stringify(items);
  const clientId = client && client.id || null;
  const clientNom = client && client.nom || 'Invité';

  if (isWeb) {
    COMMANDES_WEB.unshift({
      id: COMMANDES_WEB_NEXT_ID++,
      client_id: clientId,
      client_nom: clientNom,
      total,
      date,
      items_json: itemsJson,
    });
    PANIER_WEB = [];
    return;
  }
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO commande (client_id, client_nom, total, date, items_json) VALUES (?, ?, ?, ?, ?)',
    [clientId, clientNom, total, date, itemsJson]
  );
  await db.runAsync('DELETE FROM panier');
}

export async function getCommandes() {
  if (isWeb) return [...COMMANDES_WEB];
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM commande ORDER BY date DESC');
}

export async function getCommandesClient(clientId) {
  if (isWeb) {
    return COMMANDES_WEB
      .filter(c => c.client_id === clientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  const db = await getDB();
  return await db.getAllAsync('SELECT * FROM commande WHERE client_id = ? ORDER BY date DESC', [clientId]);
}

export async function supprimerCommande(id) {
  if (isWeb) {
    COMMANDES_WEB = COMMANDES_WEB.filter(c => c.id !== id);
    return;
  }
  const db = await getDB();
  await db.runAsync('DELETE FROM commande WHERE id = ?', [id]);
}

// abonnements 
let ABONNEMENTS_WEB = [];
let aboNextId = 1;

export async function getAbonnementActif(clientId) {
  if (isWeb) return ABONNEMENTS_WEB.find(a => a.client_id === clientId && a.statut === 'actif') || null;
  const db = await getDB();
  return await db.getFirstAsync("SELECT * FROM abonnement WHERE client_id = ? AND statut = 'actif'", [clientId]);
}

export async function creerAbonnement(clientId, forfaitId, appelsInter) {
  const f = FORFAITS.find(x => x.id === forfaitId);
  if (!f || f.id === 'aucun') return;

  const intl = appelsInter ? 1 : 0;

  if (isWeb) {
    ABONNEMENTS_WEB.push({
      id: aboNextId++, client_id: clientId,
      forfait_id: f.id, forfait_nom: f.nom, forfait_mensuel: f.mensuel,
      forfait_data_inclus: f.dataLimite, forfait_minutes_inclus: f.minutesLimite,
      appels_internationaux: intl, date_debut: new Date().toISOString(), statut: 'actif',
    });
  } else {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO abonnement (client_id, forfait_id, forfait_nom, forfait_mensuel, forfait_data_inclus, forfait_minutes_inclus, appels_internationaux, date_debut, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId, f.id, f.nom, f.mensuel, f.dataLimite || 0, f.minutesLimite || 0, intl, new Date().toISOString(), 'actif']
    );
  }
}

export async function changerForfait(clientId, forfaitId, appelsInter) {
  await annulerAbonnement(clientId);
  await creerAbonnement(clientId, forfaitId, appelsInter);
}

export async function annulerAbonnement(clientId) {
  if (isWeb) {
    const a = ABONNEMENTS_WEB.find(x => x.client_id === clientId && x.statut === 'actif');
    if (a) a.statut = 'annule';
    return;
  }
  const db = await getDB();
  await db.runAsync("UPDATE abonnement SET statut = 'annule' WHERE client_id = ? AND statut = 'actif'", [clientId]);
}
