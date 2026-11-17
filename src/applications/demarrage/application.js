import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { mouvementReduit } from "../../lib/medias.js";
import titreLisse from "../../assets/titre/omar-lisse.webp";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import "./style.css";

/**
 * Écran de démarrage : journal « [ OK ] », barre de progression, bouton
 * PASSER (ou Échap). Environ 2,5 s ; écourté si déjà vu pendant la visite
 * ou si le visiteur demande moins d'animations.
 */

const ETAPES = [
  ["Démarrage de NOS", 18],
  ["Chargement des projets", 42],
  ["Chargement des compétences", 66],
  ["Ouverture du bureau", 88],
  ["Bienvenue", 100],
];

let M = {
  etape: 0, // étapes déjà affichées
  termine: false,
  dejaVu: false,
  reduit: false,
};

let C = {};

C.minuterie = null;
C.actions = null; // { surFin }

C.avancer = function () {
  if (M.etape >= ETAPES.length) {
    C.minuterie = setTimeout(C.handler_terminer, M.reduit ? 0 : M.dejaVu ? 120 : 280);
    return;
  }
  M.etape += 1;
  V.rafraichir();
  let rapide = M.reduit || M.dejaVu;
  C.minuterie = setTimeout(C.avancer, rapide ? 90 : 380 + (M.etape % 3) * 60);
};

/** Fin du chargement (ou PASSER / Échap). */
C.handler_terminer = function () {
  if (M.termine) {
    return;
  }
  M.termine = true;
  clearTimeout(C.minuterie);
  V.terminer();
  C.actions.surFin();
};

/**
 * @param {{dejaVu: boolean, surFin: () => void}} options
 */
C.init = function (options) {
  M.dejaVu = options.dejaVu;
  M.reduit = mouvementReduit();
  C.actions = options;
  let element = V.init();
  document.addEventListener("keydown", function (e) {
    if (!M.termine && e.key === "Escape") {
      C.handler_terminer();
    }
  });
  C.avancer();
  return element;
};

let V = {};

V.racine = null;

V.init = function () {
  let fragment = htmlToFragment(genericRenderer(template, { titre: titreLisse }));
  V.racine = fragment.firstElementChild;
  V.racine.querySelector(".demarrage__passer").addEventListener("click", C.handler_terminer);
  return V.racine;
};

/** Ajoute les nouvelles lignes du journal et avance la barre. */
V.rafraichir = function () {
  let journal = V.racine.querySelector(".demarrage__journal");
  for (let i = journal.children.length; i < M.etape; i++) {
    journal.appendChild(htmlToFragment(genericRenderer(templateLigne, { texte: ETAPES[i][0] })));
  }
  V.progression(M.etape ? ETAPES[M.etape - 1][1] : 0);
};

V.progression = function (pourcent) {
  V.racine.querySelector(".demarrage__remplissage").style.width = pourcent + "%";
  V.racine.querySelector(".demarrage__pourcentage").textContent = pourcent + "%";
};

/** Fondu de sortie, puis l'écran est retiré. */
V.terminer = function () {
  V.progression(100);
  V.racine.classList.add("demarrage--sortie");
  setTimeout(() => {
    V.racine.hidden = true;
  }, M.reduit ? 0 : 460);
};

/**
 * Vrai tant que l'écran de démarrage est affiché (les raccourcis du bureau
 * attendent).
 *
 * @returns {boolean}
 */
export function demarrageEnCours() {
  return !!V.racine && !V.racine.hidden;
}

/**
 * @param {{dejaVu: boolean, surFin: () => void}} options
 * @returns {HTMLElement}
 */
export function DemarrageApplication(options) {
  return C.init(options);
}
