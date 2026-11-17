/**
 * Questions posées au navigateur sur l'écran et les préférences du visiteur.
 */

const requeteMobile = window.matchMedia("(max-width: 700px)");
const requeteMouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Vrai sous 700 px de large : version téléphone (fenêtres en plein écran).
 *
 * @returns {boolean}
 */
export function estMobile() {
  return requeteMobile.matches;
}

/**
 * Appelle fn à chaque passage ordinateur ↔ téléphone.
 *
 * @param {() => void} fn
 */
export function surChangementMobile(fn) {
  requeteMobile.addEventListener("change", fn);
}

/**
 * Vrai si le visiteur demande à réduire les animations (réglage du système).
 *
 * @returns {boolean}
 */
export function mouvementReduit() {
  return requeteMouvementReduit.matches;
}
