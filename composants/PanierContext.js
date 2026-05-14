import { createContext, useContext, useEffect, useState } from 'react';
import {
  getPanier,
  ajouterAuPanier,
  retirerDuPanier,
  modifierQuantite as dbModifierQuantite,
  viderPanier,
  passerCommande as dbPasserCommande,
} from '../db/database';

const PanierContext = createContext(null);
//https://react.dev/reference/react/createContext
export function PanierProvider({ children }) {
  const [items, setItems] = useState([]);

  // charge le panier au start
  useEffect(() => {
    recharger();
  }, []);

  async function recharger() {
    setItems(await getPanier());
  }

  async function ajouter(produit) {
    await ajouterAuPanier(produit);
    await recharger();
  }

  async function retirer(id) {
    await retirerDuPanier(id);
    await recharger();
  }

  async function modifierQuantite(id, quantite) {
    await dbModifierQuantite(id, quantite);
    await recharger();
  }

  async function vider() {
    await viderPanier();
    setItems([]);
  }

  async function passerCommande(client) {
    const t = total;
    await dbPasserCommande(client, items, t);
    setItems([]);
    return t;
  }

  // calculs du total + compte

  //calculer le total du panier
  const total = items.reduce((acc, item) => {
    const prix = parseFloat(String(item.prix).replace(/[^0-9\-]/g, '')) || 0;
    return acc + prix * item.quantite;
  }, 0);

  const compte = items.length;

  return (
    <PanierContext.Provider value={{ items, total, compte, ajouter, retirer, modifierQuantite, vider, passerCommande, recharger }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  const context = useContext(PanierContext);
  if (!context) throw new Error('erreur');
  return context;
}
