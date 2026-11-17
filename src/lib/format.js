/**
 * Mises en forme pures, réutilisées par les vues et les contrôleurs.
 */

/**
 * Nombre sur deux chiffres : 3 → « 03 ».
 *
 * @param {number} n
 * @returns {string}
 */
export function deuxChiffres(n) {
  return (n < 10 ? "0" : "") + n;
}

/**
 * Nombre suivi du mot au singulier ou au pluriel : « 1 projet », « 4 projets ».
 *
 * @param {number} n
 * @param {string} singulier
 * @param {string} pluriel
 * @returns {string}
 */
export function compter(n, singulier, pluriel) {
  return n + " " + (n > 1 ? pluriel : singulier);
}

/**
 * Texte réduit à des minuscules et des tirets, pour un chemin d'URL fictif.
 *
 * @param {string} texte
 * @returns {string}
 */
export function versSlug(texte) {
  return texte.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Code « ID 0x1A2B » d'une fenêtre, calculé à partir de son identifiant
 * (toujours le même pour une même fenêtre).
 *
 * @param {string} id
 * @returns {string}
 */
export function codeFenetre(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  }
  return "0x" + ("000" + h.toString(16).toUpperCase()).slice(-4);
}
