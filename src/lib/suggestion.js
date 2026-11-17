/**
 * Suggestions « Vouliez-vous dire … ? » du terminal.
 */

/**
 * Distance d'édition (Levenshtein) : nombre minimal de lettres à ajouter,
 * retirer ou remplacer pour passer de a à b.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function distanceEdition(a, b) {
  let precedente = [];
  for (let j = 0; j <= b.length; j++) {
    precedente[j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    let courante = [i];
    for (let j = 1; j <= b.length; j++) {
      let cout = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      courante[j] = Math.min(precedente[j] + 1, courante[j - 1] + 1, precedente[j - 1] + cout);
    }
    precedente = courante;
  }
  return precedente[b.length];
}

/**
 * Mot de la liste le plus proche de la saisie, s'il est assez proche
 * (au plus 1 ou 2 fautes selon la longueur). Un début de mot compte comme
 * une seule faute.
 *
 * @param {string} saisie
 * @param {string[]} liste
 * @returns {string} - Le mot trouvé, ou "" si aucun ne convient.
 */
export function plusProche(saisie, liste) {
  if (!saisie) {
    return "";
  }
  let mot = saisie.toLowerCase();
  let meilleur = "";
  let meilleureDistance = 99;
  for (let candidat of liste) {
    let c = candidat.toLowerCase();
    let d = distanceEdition(mot, c);
    if (c.startsWith(mot) && mot.length >= 2) {
      d = Math.min(d, 1);
    }
    if (d < meilleureDistance) {
      meilleureDistance = d;
      meilleur = candidat;
    }
  }
  let tolerance = Math.min(2, Math.max(1, Math.floor(mot.length / 2)));
  return meilleureDistance <= tolerance ? meilleur : "";
}
