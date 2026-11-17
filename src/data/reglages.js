/**
 * Réglages du visiteur, conservés dans le navigateur.
 *
 * localStorage pour ce qui doit durer (son, effets, fond d'écran),
 * sessionStorage pour ce qui ne vaut que pendant la visite (chargement déjà vu).
 * Chaque accès est protégé : le site doit fonctionner avec un stockage vide,
 * plein ou bloqué (navigation privée).
 */

const CLES = {
  son: "nos-sfx",
  musique: "nos-music",
  glitch: "nos-fx-glitch",
  animation: "nos-fx-motion",
  fond: "nos-v2-wallpaper",
  titreMasque: "nos-v2-notitle",
  demarrageVu: "nos-boot-seen",
  guideVu: "nos-guide-seen",
};

/**
 * @param {Storage} stockage
 * @param {string} cle
 * @returns {string|null}
 */
function lireBrut(stockage, cle) {
  try {
    return stockage.getItem(cle);
  } catch (erreur) {
    return null;
  }
}

/**
 * @param {Storage} stockage
 * @param {string} cle
 * @param {string|null} valeur - null efface la clé.
 * @returns {boolean} - Faux si le stockage a refusé (plein, bloqué).
 */
function ecrireBrut(stockage, cle, valeur) {
  try {
    if (valeur === null) {
      stockage.removeItem(cle);
    } else {
      stockage.setItem(cle, valeur);
    }
    return true;
  } catch (erreur) {
    return false;
  }
}

let ReglagesData = {};

/**
 * Tous les réglages, avec leur valeur par défaut si rien n'est enregistré.
 *
 * @returns {{son: boolean, musique: boolean, glitch: boolean, animation: boolean,
 *            fond: string, titreMasque: boolean, demarrageVu: boolean, guideVu: boolean}}
 */
ReglagesData.lire = function () {
  return {
    son: lireBrut(localStorage, CLES.son) !== "off",
    musique: lireBrut(localStorage, CLES.musique) !== "off",
    glitch: lireBrut(localStorage, CLES.glitch) !== "off",
    animation: lireBrut(localStorage, CLES.animation) !== "off",
    fond: lireBrut(localStorage, CLES.fond) || "",
    titreMasque: lireBrut(localStorage, CLES.titreMasque) === "1",
    demarrageVu: lireBrut(sessionStorage, CLES.demarrageVu) === "1",
    guideVu: lireBrut(sessionStorage, CLES.guideVu) === "1",
  };
};

/**
 * Enregistre un interrupteur : son, musique, glitch ou animation.
 *
 * @param {"son"|"musique"|"glitch"|"animation"} nom
 * @param {boolean} actif
 */
ReglagesData.ecrireInterrupteur = function (nom, actif) {
  ecrireBrut(localStorage, CLES[nom], actif ? "on" : "off");
};

/**
 * Enregistre l'image de fond (data URL), ou l'efface si src est vide.
 *
 * @param {string} src
 * @returns {boolean} - Faux si l'image n'a pas pu être gardée (trop lourde).
 */
ReglagesData.ecrireFond = function (src) {
  return ecrireBrut(localStorage, CLES.fond, src || null);
};

/**
 * @param {boolean} masque
 */
ReglagesData.ecrireTitreMasque = function (masque) {
  ecrireBrut(localStorage, CLES.titreMasque, masque ? "1" : "");
};

/** Note que le chargement a été vu pendant cette visite. */
ReglagesData.noterDemarrageVu = function () {
  ecrireBrut(sessionStorage, CLES.demarrageVu, "1");
};

/** Note que la bulle de bienvenue a été fermée pendant cette visite. */
ReglagesData.noterGuideVu = function () {
  ecrireBrut(sessionStorage, CLES.guideVu, "1");
};

export { ReglagesData };
