/**
 * Conserver le focus clavier quand une vue est reconstruite.
 *
 * Une vue se reconstruit entièrement à partir du modèle (V.rafraichir) : les
 * anciens éléments disparaissent, et le focus avec eux. Les éléments qui
 * peuvent avoir le focus portent un attribut data-focus ; on le relève avant
 * la reconstruction et on redonne le focus à l'élément équivalent après.
 */

/**
 * Relève l'élément focalisé dans racine.
 *
 * @param {Element|null} racine
 * @returns {string|null} - La valeur de son data-focus, ou null.
 */
export function releverFocus(racine) {
  let actif = document.activeElement;
  if (!racine || !actif || !racine.contains(actif)) {
    return null;
  }
  let porteur = actif.closest("[data-focus]");
  return porteur && racine.contains(porteur) ? porteur.getAttribute("data-focus") : null;
}

/**
 * Redonne le focus à l'élément de racine qui porte la même valeur data-focus.
 *
 * @param {Element} racine
 * @param {string|null} cle
 */
export function rendreFocus(racine, cle) {
  if (cle === null) {
    return;
  }
  let cible = racine.querySelector(`[data-focus="${CSS.escape(cle)}"]`);
  if (cible) {
    cible.focus({ preventScroll: true });
  }
}

/**
 * Vrai si l'élément est encore dans la page et visible.
 *
 * @param {Element|null} element
 * @returns {boolean}
 */
export function estVisible(element) {
  return !!element && element.isConnected && !element.closest("[hidden]") && element.getClientRects().length > 0;
}
