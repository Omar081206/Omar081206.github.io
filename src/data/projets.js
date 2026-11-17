/**
 * Projets présentés dans le portfolio.
 *
 * Chaque projet a une clé courte (cc, st…) utilisée partout : arbre de
 * l'explorateur, fiches, compétences, fichiers du terminal.
 * Les captures sont dans public/img/projets/<clé>/.
 * liens : adresses de la maquette (touche F) et du code (touche G) ; un lien
 * absent masque le bouton. libellesLiens remplace le texte par défaut du bouton.
 */

const PROJETS = {
  cc: {
    nom: "PlayStation Click & Collect",
    badge: "SAé 3.01",
    code: "SAé 3.01",
    type: "Projet universitaire",
    annee: "2026",
    icone: "i-bag",
    description: "Boutique PlayStation : réserver en ligne, retirer en magasin.",
    meta: [
      { libelle: "Contexte", valeur: "SAé 3.01, BUT MMI 2e année" },
      { libelle: "Rôle", valeur: "Conception, front et back-end" },
      { libelle: "Livré", valeur: "Octobre 2026" },
      { libelle: "Équipe", valeur: "Projet individuel" },
    ],
    objectif: "Une boutique click & collect pour PlayStation (concept).",
    resultat: "Site complet : catalogue, panier, commande et back-office (stocks, statistiques, codes promo). 23 user stories livrées.",
    etapes: [
      "User stories et maquettes Figma (375, 768 et 1440 px)",
      "Base MySQL et API PHP sécurisée",
      "Front en JavaScript vanilla et Tailwind CSS",
      "Tests Playwright et mise en ligne",
    ],
    captures: [
      { src: "img/projets/cc/01.webp", legende: "Catalogue, page entière" },
      { src: "img/projets/cc/02.webp", legende: "Fiche produit avec options" },
      { src: "img/projets/cc/03.webp", legende: "Panier" },
      { src: "img/projets/cc/04.webp", legende: "Back-office : produits" },
      { src: "img/projets/cc/05.webp", legende: "Back-office : statistiques" },
      { src: "img/projets/cc/06.webp", legende: "Catalogue, 390 px" },
    ],
    technos: ["HTML", "Tailwind CSS", "JavaScript", "PHP", "MySQL", "Playwright", "Figma"],
    liens: {
      maquette: "https://www.figma.com/design/Kf8f0uZp5iU3VRt0FCPgcw/SA%C3%A9-3.01---Maquettes-PlayStation",
      code: "https://github.com/Omar081206/SAE301-PlayStation",
    },
    libellesLiens: { code: { libelle: "Voir le code", nom: "dépôt GitHub" } },
  },
  st: {
    nom: "Plateforme de streaming",
    badge: "SAé 2.03",
    code: "SAé 2.03",
    type: "Projet universitaire",
    annee: "2026",
    icone: "i-db",
    description: "Plateforme type Netflix : catalogue, profils, favoris et notes.",
    meta: [
      { libelle: "Contexte", valeur: "SAé 2.03, BUT MMI 1re année" },
      { libelle: "Rôle", valeur: "Base de données, front et back-end" },
      { libelle: "Durée", valeur: "Avril à mai 2026" },
      { libelle: "Équipe", valeur: "Projet individuel" },
    ],
    objectif: "Une plateforme de streaming avec un espace utilisateur et un back-office.",
    resultat: "Site en ligne : catalogue, recherche, fiche film, favoris, notes et statistiques. Back-office protégé pour gérer films et profils.",
    etapes: [
      "Modélisation de la base (Looping)",
      "Architecture MVC en JavaScript",
      "API PHP avec requêtes préparées (PDO)",
      "Refonte surprise en 2 jours, façon STARZ",
      "Mise en ligne et GitHub",
    ],
    captures: [
      { src: "img/projets/st/01.webp", legende: "Accueil, carrousel" },
      { src: "img/projets/st/02.webp", legende: "Favoris et catégories" },
      { src: "img/projets/st/03.webp", legende: "Fiche film" },
      { src: "img/projets/st/04.webp", legende: "Statistiques" },
      { src: "img/projets/st/05.webp", legende: "Accueil, 390 px" },
    ],
    technos: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "Looping", "GitHub"],
    liens: {
      maquette: "https://hadjzekri-sae203.mmi-limoges.fr/It%C3%A9ration%20surprise/",
      code: "https://github.com/Omar081206/SAE2.03-Hadjzekri",
    },
    libellesLiens: {
      maquette: { libelle: "Voir le site", nom: "site en ligne" },
      code: { libelle: "Voir le code", nom: "dépôt GitHub" },
    },
  },
  nt: {
    nom: "NextTech",
    badge: "SAé 1.05",
    code: "SAé 1.05",
    type: "Projet universitaire",
    annee: "2026",
    icone: "i-brace",
    description: "One page d'un journal tech fictif, générée en JavaScript.",
    meta: [
      { libelle: "Contexte", valeur: "SAé 1.05, BUT MMI 1re année" },
      { libelle: "Rôle", valeur: "Intégration et développement" },
      { libelle: "Durée", valeur: "3 semaines, janvier 2026" },
      { libelle: "Équipe", valeur: "Projet individuel" },
    ],
    objectif: "Le site one page de NextTech, un journal tech fictif, à partir d'un UI kit Figma.",
    resultat: "Site en ligne : 20 composants réutilisables générés à partir de données. Réutilisés pour deux autres one pages.",
    etapes: [
      "Maquette Figma",
      "Intégration mobile-first en BEM",
      "Templates HTML séparés des données",
      "Génération en JavaScript et mise en ligne",
    ],
    captures: [
      { src: "img/projets/nt/01.webp", legende: "Accueil, 1280 px" },
      { src: "img/projets/nt/02.webp", legende: "Section articles" },
      { src: "img/projets/nt/03.webp", legende: "Section « Why Read Us »" },
      { src: "img/projets/nt/04.webp", legende: "Accueil, 390 px" },
    ],
    technos: ["HTML", "CSS", "JavaScript", "Figma", "Apache"],
    liens: { maquette: "https://hadjzekri-sae105.mmi-limoges.fr/NextTech.html" },
    libellesLiens: { maquette: { libelle: "Voir le site", nom: "site en ligne" } },
  },
  pf: {
    nom: "NOS, ce portfolio",
    badge: "Perso",
    code: "PERSO",
    type: "Projet personnel",
    annee: "2026",
    icone: "i-logo",
    description: "Ce portfolio : un bureau d'ordinateur au style Cyberpunk 2077.",
    meta: [
      { libelle: "Contexte", valeur: "Portfolio étudiant" },
      { libelle: "Rôle", valeur: "Design et développement" },
      { libelle: "Durée", valeur: "En cours" },
      { libelle: "Stack", valeur: "HTML, CSS, JS vanilla, Vite" },
    ],
    objectif: "Montrer mes projets dans une interface qui prouve mes compétences en design et en code.",
    resultat: "Un bureau avec fenêtres, terminal, version mobile et effets inspirés de Cyberpunk 2077.",
    etapes: [
      "Wireframe du bureau",
      "Charte et composants à coins coupés",
      "Terminal et fichiers fictifs",
      "Version mobile et effets",
    ],
    captures: [
      { src: "img/projets/pf/01.jpg", legende: "Écran de démarrage" },
      { src: "img/projets/pf/02.jpg", legende: "Arbre des projets" },
      { src: "img/projets/pf/03.jpg", legende: "Écran des compétences" },
    ],
    technos: ["HTML", "CSS", "JS"],
    liens: {  },
  },
  eh: {
    nom: "Ember House",
    badge: "R3.09",
    code: "R3.09",
    type: "Maquette web",
    annee: "2026",
    icone: "i-pen",
    description: "Landing page Figma d'un restaurant de Korean BBQ haut de gamme.",
    meta: [
      { libelle: "Contexte", valeur: "TP R3.09 Restaurant, BUT MMI 2e année" },
      { libelle: "Rôle", valeur: "Direction artistique et UI" },
      { libelle: "Rendu", valeur: "22 septembre 2026" },
      { libelle: "Outil", valeur: "Figma" },
    ],
    objectif: "Donner envie de réserver chez Ember House, un Korean BBQ fictif.",
    resultat: "Landing page 1440 px : concept, menu, restaurants et réservation. Ambiance sombre, braise et cuivre.",
    etapes: [
      "Benchmark",
      "Moodboard",
      "Wireframe",
      "Maquette finale (composants, auto-layout)",
    ],
    captures: [
      { src: "img/projets/eh/01.webp", legende: "Maquette finale" },
      { src: "img/projets/eh/02.webp", legende: "Moodboard" },
      { src: "img/projets/eh/03.webp", legende: "Wireframe" },
    ],
    technos: ["Figma", "UI design", "Direction artistique"],
    liens: {
      maquette: "https://www.figma.com/design/mGa5XCDW6ffbIzQ0GHr3Fv/HADJ-ZEKRI-Omar---Ember-House?node-id=30-103",
    },
  },
  sp: {
    nom: "Lido, Films de sport",
    badge: "TP Figma",
    code: "FIGMA",
    type: "Maquette web",
    annee: "2026",
    icone: "i-pen",
    description: "Landing page Figma d'une rétrospective films de sport pour le cinéma Lido.",
    meta: [
      { libelle: "Contexte", valeur: "TP rétrospective cinéma, BUT MMI 1re année" },
      { libelle: "Rôle", valeur: "Design UI" },
      { libelle: "Rendu", valeur: "19 avril 2026" },
      { libelle: "Outil", valeur: "Figma" },
    ],
    objectif: "Plonger le visiteur dans la rétrospective et lui donner les infos pour venir.",
    resultat: "Landing page 1440 px en 5 sections, avec un carrousel de 5 films. Univers tableau de liège : affiches, tickets, coupures de presse.",
    etapes: [
      "Analyse du brief",
      "Wireframe",
      "Maquette finale",
      "Carrousel décliné film par film",
    ],
    captures: [
      { src: "img/projets/sp/01.webp", legende: "Maquette finale, film Rocky" },
      { src: "img/projets/sp/02.webp", legende: "Maquette finale, film Black Swan" },
      { src: "img/projets/sp/03.webp", legende: "Wireframe" },
    ],
    technos: ["Figma", "UI design", "Landing page"],
    liens: {
      maquette: "https://www.figma.com/design/5uLpetG6ZiA5YfPUBbFGh2/Omar-HADJ-ZEKRI---Films-de-sport?node-id=0-1",
    },
  },
  dr: {
    nom: "Dragon Radar",
    badge: "R3.09",
    code: "R3.09",
    type: "Maquette mobile",
    annee: "2026",
    icone: "i-radar",
    description: "Appli mobile inspirée du Dragon Radar de Dragon Ball Z.",
    meta: [
      { libelle: "Contexte", valeur: "TP R3.09, BUT MMI 2e année" },
      { libelle: "Rôle", valeur: "Design UI et UX" },
      { libelle: "Rendu", valeur: "1er novembre 2026" },
      { libelle: "Outil", valeur: "Figma" },
    ],
    objectif: "Créer l'appli dont aurait besoin un personnage de fiction : le Dragon Radar de Bulma.",
    resultat: "5 écrans mobiles : radar, liste, carte, collection et profil. Interface verte façon radar, identité Capsule Corp.",
    etapes: [
      "Benchmark (Google Maps, Pokémon GO)",
      "Charte graphique radar",
      "Composants Figma",
      "5 écrans et prototype",
    ],
    captures: [
      { src: "img/projets/dr/01.webp", legende: "Les 5 écrans" },
      { src: "img/projets/dr/02.webp", legende: "Radar" },
      { src: "img/projets/dr/03.webp", legende: "Boules à trouver" },
      { src: "img/projets/dr/04.webp", legende: "Carte et itinéraire" },
      { src: "img/projets/dr/05.webp", legende: "Mes boules" },
      { src: "img/projets/dr/06.webp", legende: "Profil" },
    ],
    technos: ["Figma", "Mobile", "UI", "Composants"],
    liens: {
      maquette: "https://www.figma.com/design/Mrt12kD7BWfx1oz7uQP1AV/HADJ-ZEKRI-Omar---Dragon-ball-z?node-id=4009-548",
    },
  },
};

/** Dossiers de l'explorateur, dans l'ordre d'affichage. */
const CATEGORIES = [
  { id: "sites", libelle: "Sites web", icone: "i-code", projets: ["cc", "st", "nt", "pf"] },
  { id: "maquettes", libelle: "Maquettes UI", icone: "i-pen", projets: ["dr", "eh", "sp"] },
];

/** Textes par défaut des boutons de lien. */
const LIBELLES_LIENS = {
  maquette: { libelle: "Voir la maquette", nom: "maquette Figma" },
  code: { libelle: "Voir le code", nom: "code source" },
};

let ProjetsData = {};

/**
 * Un projet par sa clé.
 *
 * @param {string} cle
 * @returns {Object|null}
 */
ProjetsData.lire = function (cle) {
  return Object.prototype.hasOwnProperty.call(PROJETS, cle) ? PROJETS[cle] : null;
};

/**
 * Toutes les clés de projets, dans l'ordre des dossiers.
 *
 * @returns {string[]}
 */
ProjetsData.cles = function () {
  return CATEGORIES.flatMap((c) => c.projets);
};

/**
 * Les dossiers de l'explorateur.
 *
 * @returns {Array<{id: string, libelle: string, icone: string, projets: string[]}>}
 */
ProjetsData.categories = function () {
  return CATEGORIES;
};

/**
 * Texte du bouton et nom du lien pour un projet : « Voir le site » / « site en ligne »…
 *
 * @param {string} cle
 * @param {"maquette"|"code"} sorte
 * @returns {{libelle: string, nom: string}}
 */
ProjetsData.libelleLien = function (cle, sorte) {
  let projet = ProjetsData.lire(cle);
  return (projet && projet.libellesLiens && projet.libellesLiens[sorte]) || LIBELLES_LIENS[sorte];
};

export { ProjetsData };
