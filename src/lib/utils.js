/**
 * Outils de rendu des templates (repris du starter de la SAé 3.01).
 */

/**
 * Échappe les caractères qui ont un sens en HTML.
 *
 * Sans cela, une donnée contenant « <img src=x onerror=…> » deviendrait une
 * vraie balise une fois insérée dans la page, et son script s'exécuterait.
 *
 * @param {*} valeur
 * @returns {string}
 */
function escapeHtml(valeur) {
  return String(valeur)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Remplace les placeholders {{cle}} d'un template par les valeurs de data.
 *
 * Les valeurs sont échappées : un placeholder ne produit jamais que du texte.
 * Pour insérer un autre composant, on passe par un <slot> (voir htmlToFragment).
 *
 * @param {string} template - Le template HTML contenant des placeholders {{cle}}.
 * @param {Object} data - Les valeurs, indexées par le nom du placeholder.
 * @returns {string} - Le HTML obtenu.
 */
let genericRenderer = function (template, data) {
  let html = template;
  for (let key in data) {
    // Une fonction comme valeur de remplacement : dans une chaîne, replaceAll
    // interpréterait les séquences spéciales comme « $& ».
    html = html.replaceAll(`{{${key}}}`, () => escapeHtml(data[key]));
  }
  return html;
};

/**
 * Convertit une chaîne HTML en DocumentFragment.
 *
 * Le fragment peut être manipulé (querySelector, replaceWith, addEventListener)
 * avant d'être inséré dans la page.
 *
 * @param {string} htmlString - Le HTML à convertir.
 * @returns {DocumentFragment}
 */
function htmlToFragment(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content;
}

/**
 * Remplace le <slot name="…"> d'un fragment par un contenu, ou le retire si
 * le contenu est null.
 *
 * @param {DocumentFragment|Element} racine
 * @param {string} nom - Valeur de l'attribut name du slot.
 * @param {Node|Node[]|null} contenu
 */
function remplirSlot(racine, nom, contenu) {
  let slot = racine.querySelector(`slot[name="${nom}"]`);
  if (!slot) {
    return;
  }
  if (contenu === null) {
    slot.remove();
  } else if (Array.isArray(contenu)) {
    slot.replaceWith(...contenu);
  } else {
    slot.replaceWith(contenu);
  }
}

export { genericRenderer, htmlToFragment, remplirSlot };
