import { mouvementReduit } from "./medias.js";

const GLYPHES = "!<>-_/[]{}=+*^?#01ABCDEF";
const DUREE = 360;

// Animation en cours pour chaque élément, pour pouvoir l'interrompre
const animations = new WeakMap();

/**
 * Affiche un texte qui « se déchiffre » : les lettres passent par des
 * caractères au hasard avant de se fixer de gauche à droite.
 * Sans animation (préférence du visiteur), le texte s'affiche directement.
 *
 * @param {HTMLElement|null} element
 * @param {string} texte
 */
export function dechiffrer(element, texte) {
  if (!element) {
    return;
  }
  if (animations.has(element)) {
    cancelAnimationFrame(animations.get(element));
    animations.delete(element);
  }
  if (mouvementReduit()) {
    element.textContent = texte;
    return;
  }

  let debut = null;
  function image(t) {
    if (debut === null) {
      debut = t;
    }
    let k = Math.min(1, (t - debut) / DUREE);
    let fixes = Math.floor(k * texte.length);
    let sortie = "";
    for (let i = 0; i < texte.length; i++) {
      let lettre = texte.charAt(i);
      sortie += i < fixes || lettre === " " ? lettre : GLYPHES.charAt(Math.floor(Math.random() * GLYPHES.length));
    }
    element.textContent = sortie;
    if (k < 1) {
      animations.set(element, requestAnimationFrame(image));
    } else {
      animations.delete(element);
    }
  }
  animations.set(element, requestAnimationFrame(image));
}
