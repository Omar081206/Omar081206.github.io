import { CompetencesData } from "../../data/competences.js";
import { ProjetsData } from "../../data/projets.js";
import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { compter } from "../../lib/format.js";
import { releverFocus, rendreFocus } from "../../lib/focus.js";
import { dechiffrer } from "../../lib/texte.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import { EtiquettesView } from "../../ui/etiquettes/index.js";
import template from "./template.html?raw";
import templateNoeud from "./noeud.html?raw";
import templatePanneau from "./panneau.html?raw";
import templateSavoir from "./savoir.html?raw";
import templateProjet from "./projet.html?raw";
import "./style.css";

/**
 * Fenêtre « Compétences » : écran d'attributs façon jeu. Six nœuds reliés au
 * cœur ; le nœud choisi affiche à droite ses savoir-faire, ses outils et les
 * projets liés.
 */

let M = {
  cle: "front", // compétence choisie
};

let C = {};

C.actions = null; // { ouvrirFiche, explorer }, fournies par le bureau

C.handler_selectionner = function (cle) {
  M.cle = cle;
  V.rafraichir();
};

/**
 * @param {string} cle - Projet.
 * @param {HTMLElement} bouton
 */
C.handler_ouvrirProjet = function (cle, bouton) {
  C.actions.ouvrirFiche(cle, bouton);
};

/**
 * Ouvre l'explorateur de projets filtré sur la compétence choisie.
 *
 * @param {HTMLElement|null} bouton
 */
C.handler_explorer = function (bouton) {
  C.actions.explorer(M.cle, bouton);
};

/**
 * Entrée (hors bouton) : ouvre l'explorateur de projets.
 *
 * @param {KeyboardEvent} e
 * @returns {boolean}
 */
C.surTouche = function (e) {
  if (e.key === "Enter" && !e.target.closest("button, a")) {
    C.actions.explorer(null, null);
    return true;
  }
  return false;
};

C.init = function (actions) {
  C.actions = actions;
  return V.init();
};

let V = {};

V.racine = null; // élément .competences

V.init = function () {
  let fragment = htmlToFragment(template);
  V.racine = fragment.firstElementChild;
  let noeuds = CompetencesData.cles().map(V.createNoeud);
  remplirSlot(fragment, "noeuds", noeuds);
  V.appliquerSelection();
  V.racine.querySelector(".competences__panneau").replaceChildren(V.createPanneau());
  return FenetreView.dom({ id: "competences", titre: "Compétences" }, fragment);
};

/**
 * Les nœuds de la carte restent en place (ils ne font que changer d'état) ;
 * le panneau de droite est reconstruit.
 */
V.rafraichir = function () {
  let focus = releverFocus(V.racine);
  V.appliquerSelection();
  V.racine.querySelector(".competences__panneau").replaceChildren(V.createPanneau());
  rendreFocus(V.racine, focus);
  dechiffrer(V.racine.querySelector(".competences__nom"), CompetencesData.lire(M.cle).nom);
};

/** Nœud choisi enfoncé, son lien vers le cœur allumé. */
V.appliquerSelection = function () {
  for (let noeud of V.racine.querySelectorAll(".carte-attributs__noeud")) {
    noeud.setAttribute("aria-pressed", noeud.getAttribute("data-cle") === M.cle ? "true" : "false");
  }
  for (let lien of V.racine.querySelectorAll(".carte-attributs__lien")) {
    lien.classList.toggle("carte-attributs__lien--actif", lien.getAttribute("data-lien") === M.cle);
  }
};

V.createNoeud = function (cle) {
  let c = CompetencesData.lire(cle);
  let fragment = htmlToFragment(genericRenderer(templateNoeud, { cle, icone: c.icone, nom: c.nom }));
  fragment.querySelector("button").addEventListener("click", () => C.handler_selectionner(cle));
  return fragment;
};

V.createPanneau = function () {
  let c = CompetencesData.lire(M.cle);
  let fragment = htmlToFragment(
    genericRenderer(templatePanneau, {
      nom: c.nom,
      nombreProjets: compter(c.projets.length, "projet lié", "projets liés"),
      description: c.description,
    })
  );
  remplirSlot(
    fragment,
    "savoirs",
    c.savoirs.map((texte) => htmlToFragment(genericRenderer(templateSavoir, { texte })))
  );
  remplirSlot(fragment, "outils", EtiquettesView.dom(c.outils, { titreId: "competences-outils" }));
  remplirSlot(fragment, "projets", c.projets.map(V.createProjet));
  let explorer = fragment.querySelector('[data-action="explorer"]');
  explorer.addEventListener("click", () => C.handler_explorer(explorer));
  return fragment;
};

V.createProjet = function (cle) {
  let p = ProjetsData.lire(cle);
  let fragment = htmlToFragment(genericRenderer(templateProjet, { cle, icone: p.icone, nom: p.nom, code: p.code }));
  let bouton = fragment.querySelector("button");
  bouton.addEventListener("click", () => C.handler_ouvrirProjet(cle, bouton));
  return fragment;
};

/**
 * Actions offertes au bureau.
 */
export let CompetencesActions = {
  surTouche: (e) => C.surTouche(e),
};

/**
 * @param {{ouvrirFiche: (cle: string, declencheur: HTMLElement) => void,
 *          explorer: (competence: string|null, declencheur: HTMLElement|null) => void}} actions
 * @returns {HTMLElement}
 */
export function CompetencesApplication(actions) {
  return C.init(actions);
}
