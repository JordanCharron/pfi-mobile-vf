// Envoi de courriel avec EmailJS https://www.emailjs.com/

const EMAILJS_SERVICE_ID  = 'service_144s8c5';
const EMAILJS_TEMPLATE_ID = 'template_xcrv96e';
const EMAILJS_PUBLIC_KEY  = 'OYdl6-WncDssGdRaz';

export function envoyerCourrielCommande(user, items, total, forfait, appelsInter) {
  if (!user || !user.courriel) return false;

 
  const tousLesItems = [...items];
  if (forfait) {
    const mensuel = forfait.mensuel + (appelsInter ? 10 : 0);
    tousLesItems.push({
      nom: 'Forfait ' + forfait.nom + (appelsInter ? ' + appels internationaux' : '') + ' (' + mensuel + ' $/mois)',
      quantite: 1,
      prix: '0 $',
      image: 'https://cdn-icons-png.flaticon.com/512/684/684934.png',
    });
  }

  // tableau item
  const orders = tousLesItems.map(it => {
    let prixNum = 0;
    if (typeof it.prix === 'number') prixNum = it.prix;
    else prixNum = parseFloat(String(it.prix).replace(/[^0-9\-]/g, '')) || 0;
    return {
      name: it.nom,
      units: it.quantite,
      price: prixNum.toFixed(2),
      image_url: it.image,
    };
  });

  const totalNum = typeof total === 'number'
    ? total.toFixed(2)
    : (parseFloat(String(total).replace(/[^0-9\-]/g, '')) || 0).toFixed(2);

  const params = {
    email: user.courriel,
    order_id: 'NT-' + Date.now(),
    orders: orders,
    cost: { total: totalNum },
  };

  return fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params,
    }),
  })
    .then(res => {
      if (!res.ok) {
        console.warn('courriel échec', res.status);
        return false;
      }
      return true;
    })
    .catch(e => {
      console.warn('courriel exception', e.message);
      return false;
    });
}
