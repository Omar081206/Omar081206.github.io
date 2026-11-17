/**
 * Identité et coordonnées d'Omar. Une seule source pour l'accueil, le profil,
 * le contact et les fichiers about.txt / contact.txt du terminal.
 */

const PROFIL = {
  prenom: "Omar",
  accroche: "Étudiant BUT MMI 2e année · développeur web · cherche un stage dès avril 2027",
  presentation:
    "Étudiant en BUT MMI à Limoges, parcours développement web. Je conçois des interfaces et je les code, de la maquette Figma à la mise en ligne.",
  faits: [
    { libelle: "FORMATION", valeur: "BUT MMI 2e année" },
    { libelle: "BASE", valeur: "Marseille et Limoges" },
    { libelle: "STAGE", valeur: "Dès avril 2027" },
    { libelle: "LANGUES", valeur: "Français, anglais B2, arabe" },
  ],
  disponibilite: "Disponible pour un stage dès avril 2027",
  mail: "omar.hadj@etu.unilim.fr",
  linkedin: {
    url: "https://www.linkedin.com/in/omar-hadj-zekri-a64a69398/",
    texte: "linkedin.com/in/omar-hadj-zekri-a64a69398",
  },
  github: { url: "https://github.com/Omar081206", texte: "github.com/Omar081206" },
  // Fichier à déposer dans public/ (version sans téléphone ni adresse)
  cv: "cv-omar-hadj-zekri.pdf",
  credits:
    "Bruitages et musique (thème du menu principal) : Cyberpunk 2077 © CD PROJEKT RED. Œuvre de fan non officielle, non approuvée par CD PROJEKT RED.",
};

let ProfilData = {};

/**
 * Le profil complet.
 *
 * @returns {Object}
 */
ProfilData.lire = function () {
  return PROFIL;
};

export { ProfilData };
