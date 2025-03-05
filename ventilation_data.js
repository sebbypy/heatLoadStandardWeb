const occupancyRates = {
  "Horeca": {
    "Restaurants, cafétéria, buffet rapide, cantine, bars, cocktail-bar": 1.5,
    "Cuisines, kitchenettes": 10
  },
  "Hôtels, motels, centres de vacances": {
    "Chambres à coucher d’hôtel, de motel, de centre de vacances": 10,
    "Dortoirs de centres de vacances": 5,
    "Lobby, hall d’entrée": 2,
    "Salle de réunion, espace de rencontre, salle polyvalente": 2
  },
  "Immeubles de bureaux": {
    "Bureau": 15,
    "Locaux de réception, réception, salles de réunions": 3.5,
    "Entrée principale": 10
  },
  "Lieux publics": {
    "Hall des départs, salle d’attente": 1,
    "Bibliothèque": 10
  },
  "Lieux de rassemblement publics": {
    "Église et autres bâtiments religieux, bâtiments gouvernementaux, salles d’audience, musées et galeries": 2.5
  },
  "Commerce de détail": {
    "Local de vente, magasin (sauf centres commerciaux)": 7,
    "Centre commercial": 2.5,
    "Salon de coiffure, institut de beauté": 4,
    "Magasins de meubles, tapis, textiles": 20,
    "Supermarché, grand magasin, magasin spécialisé pour animaux": 10,
    "Laverie automatique": 5
  },
  "Sports et loisirs": {
    "Hall de sport, stades (salle de jeu), salle de gymnastique": 3.5,
    "Vestiaires": 2,
    "Espace de spectateurs, tribunes": 1,
    "Discothèque/dancing": 1,
    "Club sportif : salles d’aérobic, salle de fitness, club de bowling": 10
  },
  "Locaux de travail": {
    "Studio de photographie, chambre noire": 10,
    "Pharmacie (local de préparation)": 10,
    "Salle des guichets dans les banques / salle des coffres destinée au public": 20,
    "Local de photocopie / local des imprimantes": 10,
    "Local informatique (sans local des imprimantes)": 25
  },
  "Établissements d’enseignement": {
    "Salles de cours": 4,
    "Salle polyvalente": 1
  },
  "Soins de santé": {
    "Salle commune": 10,
    "Salles de traitement et d’examen": 5,
    "Salles d’opération et d’accouchement, salle de réveil et soins intensifs, salle de kinésithérapie, de physiothérapie": 5
  },
  "Établissements pénitentiaires": {
    "Cellules, salle commune": 4,
    "Postes de surveillance": 7,
    "Inscription / enregistrement / salle de garde": 2
  },
  "Autres espaces": {
    "Magasin de stockage": 100,
    "Autres espaces": 15
  }
};
