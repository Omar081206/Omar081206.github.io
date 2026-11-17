/**
 * Actions du navigateur : presse-papier, téléchargement, ouverture de lien.
 */

/**
 * Copie un texte dans le presse-papier. Essaie l'API moderne (contexte
 * sécurisé), puis l'ancienne méthode execCommand.
 *
 * @param {string} texte
 * @returns {Promise<boolean>} - Vrai si la copie a réussi.
 */
export async function copierTexte(texte) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch (erreur) {
      // Refus du navigateur : on tente l'ancienne méthode.
    }
  }
  let zone = document.createElement("textarea");
  zone.value = texte;
  zone.setAttribute("readonly", "");
  zone.style.position = "fixed";
  zone.style.opacity = "0";
  let precedent = document.activeElement;
  document.body.appendChild(zone);
  zone.select();
  let reussi = false;
  try {
    reussi = document.execCommand("copy");
  } catch (erreur) {
    reussi = false;
  }
  zone.remove();
  if (precedent && precedent.focus) {
    precedent.focus({ preventScroll: true });
  }
  return reussi;
}

/**
 * Lance le téléchargement d'un fichier du site.
 *
 * @param {string} chemin - Chemin relatif du fichier.
 */
export function telecharger(chemin) {
  let lien = document.createElement("a");
  lien.href = chemin;
  lien.setAttribute("download", "");
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
}

/**
 * Ouvre une adresse dans un nouvel onglet.
 *
 * @param {string} url
 */
export function ouvrirOnglet(url) {
  let lien = document.createElement("a");
  lien.href = url;
  lien.target = "_blank";
  lien.rel = "noopener";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
}
