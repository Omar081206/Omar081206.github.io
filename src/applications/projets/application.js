import { ProjetsData } from "../../data/projets.js";
import { CompetencesData } from "../../data/competences.js";
import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { compter, versSlug } from "../../lib/format.js";
import { estMobile, surChangementMobile } from "../../lib/medias.js";
import { releverFocus, rendreFocus } from "../../lib/focus.js";
import { dechiffrer } from "../../lib/texte.js";
import { ouvrirOnglet } from "../../lib/navigateur.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import { EtiquettesView } from "../../ui/etiquettes/index.js";
import template from "./template.html?raw";
import templateExplorateur from "./explorateur.html?raw";
import templateFiltre from "./filtre.html?raw";
import templateDossier from "./dossier.html?raw";
import templateFichier from "./fichier.html?raw";
import templateApercu from "./apercu.html?raw";
import "./style.css";

/**
 * Fenêtre « Projets » : explorateur de fichiers à gauche (dossiers et
 * projets, éventuellement filtrés par compétence), aperçu du projet choisi
 * à droite.
 *
 * Clavier : ↑ ↓ pour choisir, Entrée pour ouvrir la fiche, F et G pour les
 * liens maquette et code (voir surTouche).
 */

let M = {
  cle: "cc", // projet sélectionné
  filtre: null, // clé de compétence, ou null pour tout afficher
};

let C = {};

C.actions = null; // { ouvrirFiche, afficherMessage }, fournies par le bureau

/**
 * Projets visibles avec le filtre courant, rangés par dossier.
 *
 * @returns {Array<{dossier: Object, projets: string[]}>}
 */
C.dossiersVisibles = function () {
  let garder = M.filtre ? CompetencesData.lire(M.filtre).projets : null;
  return ProjetsData.categories()
    .map((dossier) => ({
      dossier,
      projets: dossier.projets.filter((cle) => !garder || garder.includes(cle)),
    }))
    .filter((d) => d.projets.length);
};

/** Liste à plat des projets visibles, dans l'ordre de l'arbre. */
C.clesVisibles = function () {
  return C.dossiersVisibles().flatMap((d) => d.projets);
};

C.handler_selectionner = function (cle) {
  if (cle === M.cle) {
    return; // déjà choisi : rien à redessiner (garde le double-clic intact)
  }
  M.cle = cle;
  V.rafraichir();
};

/**
 * Flèches haut / bas dans l'arbre : projet précédent ou suivant (en boucle).
 *
 * @param {number} sens - +1 ou -1.
 */
C.handler_deplacer = function (sens) {
  let cles = C.clesVisibles();
  let i = cles.indexOf(M.cle);
  M.cle = cles[(i + sens + cles.length) % cles.length];
  V.rafraichir("projet-" + M.cle);
};

/**
 * @param {string} cle
 * @param {HTMLElement|null} declencheur
 */
C.handler_ouvrirFiche = function (cle, declencheur) {
  if (cle !== M.cle) {
    M.cle = cle;
    V.rafraichir();
  }
  C.actions.ouvrirFiche(cle, declencheur);
};

/**
 * Bouton « Voir la maquette » / « Voir le code ».
 *
 * @param {"maquette"|"code"} sorte
 */
C.handler_suivreLien = function (sorte) {
  let url = ProjetsData.lire(M.cle).liens[sorte];
  if (!url) {
    return;
  }
  ouvrirOnglet(url);
  C.actions.afficherMessage("Ouverture : " + ProjetsData.libelleLien(M.cle, sorte).nom);
};

/**
 * Filtre l'explorateur sur une compétence (null : tout afficher). Si le
 * projet choisi disparaît du filtre, le premier projet visible le remplace.
 *
 * @param {string|null} competence
 */
C.handler_filtrer = function (competence) {
  M.filtre = competence;
  let cles = C.clesVisibles();
  if (!cles.includes(M.cle)) {
    M.cle = cles[0];
  }
  V.rafraichir();
};

/**
 * Raccourcis clavier quand la fenêtre est active.
 *
 * @param {KeyboardEvent} e
 * @returns {boolean} - Vrai si la touche a été utilisée.
 */
C.surTouche = function (e) {
  let touche = e.key.toLowerCase();
  if (touche === "f" || touche === "g") {
    let sorte = touche === "f" ? "maquette" : "code";
    if (!ProjetsData.lire(M.cle).liens[sorte]) {
      return true;
    }
    V.frapper(`[data-lien="${sorte}"]`);
    C.handler_suivreLien(sorte);
    return true;
  }
  let surBouton = e.target.closest("button, a");
  if (e.key === "Enter" && !surBouton) {
    V.frapper('[data-action="ouvrir"]');
    C.actions.ouvrirFiche(M.cle, null);
    return true;
  }
  return false;
};

C.init = function (actions) {
  C.actions = actions;
  return V.init();
};

let V = {};

V.racine = null; // élément .projets
V.cleAffichee = null; // projet dont le nom vient d'être « déchiffré »

V.init = function () {
  let fragment = htmlToFragment(template);
  V.racine = fragment.firstElementChild;
  V.cleAffichee = M.cle;
  remplirSlot(fragment, "explorateur", V.createExplorateur());
  V.racine.querySelector(".apercu").replaceChildren(V.createApercu());
  // L'indication « double-clic » / « touchez » dépend de l'écran
  surChangementMobile(() => V.rafraichir());
  return FenetreView.dom({ id: "projets", titre: "Projets" }, fragment);
};

/**
 * Reconstruit l'explorateur et l'aperçu à partir du modèle. L'élément
 * aperçu est gardé (région aria-live), seul son contenu change.
 *
 * @param {string} [cibleFocus] - data-focus à focaliser ensuite ; par défaut,
 *   l'équivalent de l'élément qui avait le focus.
 */
V.rafraichir = function (cibleFocus) {
  let focus = cibleFocus || releverFocus(V.racine);
  V.racine.querySelector(".explorateur").replaceWith(V.createExplorateur());
  V.racine.querySelector(".apercu").replaceChildren(V.createApercu());
  rendreFocus(V.racine, focus);
  // Le nom se « déchiffre » seulement quand le projet change
  if (V.cleAffichee !== M.cle) {
    V.cleAffichee = M.cle;
    dechiffrer(V.racine.querySelector(".apercu__nom"), ProjetsData.lire(M.cle).nom);
  }
};

V.createExplorateur = function () {
  let dossiers = C.dossiersVisibles();
  let total = dossiers.reduce((n, d) => n + d.projets.length, 0);
  let competence = M.filtre ? CompetencesData.lire(M.filtre) : null;
  let fragment = htmlToFragment(
    genericRenderer(templateExplorateur, {
      dossier: competence ? "projets?competence=" + versSlug(competence.nom) : "projets",
      total,
      motProjets: compter(total, "projet", "projets").replace(/^\d+ /, ""),
      dossiers: dossiers.length,
      motDossiers: compter(dossiers.length, "dossier", "dossiers").replace(/^\d+ /, ""),
      indice: estMobile() ? "touchez un projet pour l'ouvrir" : "double-clic pour ouvrir",
    })
  );

  let filtre = null;
  if (competence) {
    filtre = htmlToFragment(genericRenderer(templateFiltre, { nom: competence.nom }));
    filtre.querySelector('[data-action="tout"]').addEventListener("click", () => C.handler_filtrer(null));
  }
  remplirSlot(fragment, "filtre", filtre);

  remplirSlot(fragment, "dossiers", dossiers.map(V.createDossier));
  return fragment;
};

V.createDossier = function (d) {
  let fragment = htmlToFragment(
    genericRenderer(templateDossier, {
      icone: d.dossier.icone,
      libelle: d.dossier.libelle,
      compte: compter(d.projets.length, "fichier", "fichiers"),
    })
  );
  remplirSlot(fragment, "fichiers", d.projets.map(V.createFichier));
  return fragment;
};

V.createFichier = function (cle) {
  let p = ProjetsData.lire(cle);
  let fragment = htmlToFragment(genericRenderer(templateFichier, { cle, icone: p.icone, nom: p.nom, code: p.code }));
  let bouton = fragment.querySelector("button");
  bouton.setAttribute("aria-current", cle === M.cle ? "true" : "false");
  bouton.addEventListener("click", function () {
    if (estMobile()) {
      C.handler_ouvrirFiche(cle, bouton);
    } else {
      C.handler_selectionner(cle);
    }
  });
  bouton.addEventListener("dblclick", function () {
    if (!estMobile()) {
      C.handler_ouvrirFiche(cle, document.activeElement);
    }
  });
  bouton.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      C.handler_deplacer(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      C.handler_ouvrirFiche(cle, bouton);
    }
  });
  return fragment;
};

V.createApercu = function () {
  let p = ProjetsData.lire(M.cle);
  let premiere = p.captures[0];
  let fragment = htmlToFragment(
    genericRenderer(templateApercu, {
      image: premiere.src,
      legende: premiere.legende,
      nom: V.cleAffichee === M.cle ? p.nom : "",
      badge: p.badge,
      libelleMaquette: ProjetsData.libelleLien(M.cle, "maquette").libelle,
      libelleCode: ProjetsData.libelleLien(M.cle, "code").libelle,
      type: p.type,
      annee: p.annee,
      description: p.description,
    })
  );
  remplirSlot(fragment, "technos", EtiquettesView.dom(p.technos));
  let ouvrir = fragment.querySelector('[data-action="ouvrir"]');
  ouvrir.addEventListener("click", () => C.handler_ouvrirFiche(M.cle, ouvrir));
  for (let bouton of fragment.querySelectorAll("[data-lien]")) {
    let sorte = bouton.getAttribute("data-lien");
    // Un lien absent masque son bouton
    bouton.hidden = !p.liens[sorte];
    bouton.addEventListener("click", () => C.handler_suivreLien(sorte));
  }
  return fragment;
};

/**
 * Bref retour visuel sur un bouton déclenché au clavier.
 *
 * @param {string} selecteur
 */
V.frapper = function (selecteur) {
  let bouton = V.racine.querySelector(selecteur);
  if (!bouton) {
    return;
  }
  bouton.classList.add("action--frappe");
  setTimeout(() => bouton.classList.remove("action--frappe"), 180);
};

/**
 * Actions offertes aux autres applications et au bureau.
 */
export let ProjetsActions = {
  filtrer: (competence) => C.handler_filtrer(competence),
  surTouche: (e) => C.surTouche(e),
};

/**
 * @param {{ouvrirFiche: (cle: string, declencheur: HTMLElement|null) => void,
 *          afficherMessage: (texte: string) => void}} actions
 * @returns {HTMLElement}
 */
export function ProjetsApplication(actions) {
  return C.init(actions);
}
