import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { deuxChiffres } from "../../lib/format.js";
import template from "./template.html?raw";
import templateImage from "./image.html?raw";
import "./style.css";

/**
 * Visionneuse : agrandissement plein écran des captures d'une fiche.
 *
 * Fenêtre modale native (<dialog>) : Échap la ferme et le focus y reste
 * enfermé. Deux tailles : « ajustée » à l'écran, ou taille réelle.
 */

let M = {
  captures: [],
  index: 0,
  tailleReelle: false,
};

let C = {};

/**
 * @param {Array<{src: string, legende: string}>} captures
 * @param {number} index - Capture à montrer d'abord.
 */
C.handler_ouvrir = function (captures, index) {
  M.captures = captures;
  M.index = index;
  M.tailleReelle = false;
  V.ouvrir();
};

C.handler_capture = function (index) {
  M.index = (index + M.captures.length) % M.captures.length;
  V.rafraichir();
};

C.handler_echelle = function () {
  M.tailleReelle = !M.tailleReelle;
  V.ajuster();
};

let V = {};

V.racine = null; // élément <dialog>

V.init = function () {
  let fragment = htmlToFragment(template);
  V.racine = fragment.firstElementChild;
  V.racine.querySelector('[data-action="echelle"]').addEventListener("click", C.handler_echelle);
  V.racine.querySelector('[data-action="precedente"]').addEventListener("click", () => C.handler_capture(M.index - 1));
  V.racine.querySelector('[data-action="suivante"]').addEventListener("click", () => C.handler_capture(M.index + 1));
  V.racine.querySelector('[data-action="fermer"]').addEventListener("click", () => V.racine.close());
  V.racine.addEventListener("keydown", function (e) {
    // Les flèches et Échap restent dans la visionneuse (pas de raccourci du bureau)
    e.stopPropagation();
    if (e.key === "ArrowRight") {
      C.handler_capture(M.index + 1);
    } else if (e.key === "ArrowLeft") {
      C.handler_capture(M.index - 1);
    }
  });
  window.addEventListener("resize", function () {
    if (V.racine.open) {
      V.ajuster();
    }
  });
  return V.racine;
};

V.ouvrir = function () {
  V.rafraichir();
  V.racine.showModal();
  V.racine.querySelector(".visionneuse__corps").focus();
};

V.rafraichir = function () {
  let capture = M.captures[M.index];
  let corps = V.racine.querySelector(".visionneuse__corps");
  let image = htmlToFragment(genericRenderer(templateImage, capture)).firstElementChild;
  image.addEventListener("load", V.ajuster);
  corps.replaceChildren(image);
  corps.scrollTop = 0;
  V.ajuster();
  V.racine.querySelector(".visionneuse__legende").textContent =
    `Capture ${deuxChiffres(M.index + 1)} / ${deuxChiffres(M.captures.length)} · ${capture.legende}`;
  let plusieurs = M.captures.length > 1;
  V.racine.querySelector('[data-action="precedente"]').hidden = !plusieurs;
  V.racine.querySelector('[data-action="suivante"]').hidden = !plusieurs;
};

/**
 * Largeur de l'image. Ajustée : une image en largeur tient à l'écran, une
 * page longue fait au plus environ deux hauteurs d'écran.
 */
V.ajuster = function () {
  let corps = V.racine.querySelector(".visionneuse__corps");
  let image = corps.querySelector("img");
  let echelle = V.racine.querySelector('[data-action="echelle"]');
  echelle.setAttribute("aria-pressed", M.tailleReelle ? "true" : "false");
  echelle.textContent = M.tailleReelle ? "Ajuster à l'écran" : "Taille réelle";
  if (!image || !image.naturalWidth) {
    return;
  }
  let largeurDispo = corps.clientWidth - 32;
  let hauteurDispo = corps.clientHeight - 32;
  let ratio = image.naturalWidth / image.naturalHeight;
  let largeur;
  if (M.tailleReelle) {
    largeur = image.naturalWidth;
  } else if (ratio >= 1) {
    largeur = Math.min(largeurDispo, hauteurDispo * ratio);
  } else {
    largeur = Math.max(Math.min(480, largeurDispo), hauteurDispo * 1.8 * ratio);
  }
  image.style.width = Math.round(Math.min(largeur, image.naturalWidth, largeurDispo)) + "px";
};

/**
 * Actions offertes au bureau.
 */
export let VisionneuseActions = {
  ouvrir: (captures, index) => C.handler_ouvrir(captures, index),
  /**
   * Ferme la visionneuse si elle est ouverte (bouton « retour » du téléphone).
   *
   * @returns {boolean} - Vrai si elle était ouverte.
   */
  fermer: function () {
    if (V.racine && V.racine.open) {
      V.racine.close();
      return true;
    }
    return false;
  },
};

/**
 * @returns {HTMLDialogElement}
 */
export function VisionneuseApplication() {
  return V.init();
}
