import { FichiersData } from "../../data/fichiers.js";
import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { estMobile } from "../../lib/medias.js";
import { Son } from "../../lib/son.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import { creerCommandes } from "./commandes.js";
import template from "./template.html?raw";
import templatePuce from "./puce.html?raw";
import templateLigne from "./ligne.html?raw";
import templateEntrees from "./entrees.html?raw";
import templateEntree from "./entree.html?raw";
import "./style.css";

/**
 * Fenêtre « Terminal » : mini-shell sur le système de fichiers fictif
 * (data/fichiers.js). Les commandes sont dans commandes.js.
 */

const PUCES = [
  ["open projets", "open projets"],
  ["cat ~/contact.txt", "cat contact.txt"],
  ["cv", "cv"],
  ["ls", "ls"],
  ["cd projets", "cd projets"],
  ["cd ..", "cd .."],
  ["tree", "tree"],
  ["help", "help"],
  ["clear", "clear"],
];

let M = {
  courant: FichiersData.ACCUEIL, // dossier courant
  historique: [], // commandes tapées
  position: 0, // place dans l'historique (flèches haut / bas)
  // Lignes affichées : { sorte: "texte"|"commande"|"erreur"|"dossier"|"indice", texte }
  // ou { sorte: "entrees", entrees: [{ nom, dossier }] } pour ls
  lignes: [{ sorte: "texte", texte: "NOS v0.1\nTapez help pour voir les commandes.\n" }],
};

let C = {};

C.commandes = null;

/** Sortie offerte aux commandes : elle n'écrit que dans le modèle. */
C.sortie = {
  ecrire: function (texte, sorte) {
    M.lignes.push({ sorte: sorte || "texte", texte });
  },
  ecrireEntrees: function (entrees) {
    M.lignes.push({ sorte: "entrees", entrees });
  },
  effacer: function () {
    M.lignes = [];
  },
};

/**
 * Exécute la ligne tapée (ou une commande rapide).
 *
 * @param {string} saisie
 */
C.handler_executer = function (saisie) {
  let ligne = saisie.trim();
  M.lignes.push({ sorte: "commande", texte: `netrunner:${FichiersData.raccourcir(M.courant)}$ ${ligne}` });
  if (ligne) {
    M.historique.push(ligne);
    M.position = M.historique.length;
    if (!C.commandes.executer(ligne)) {
      Son.jouer("error");
    }
  }
  V.rafraichir();
};

/**
 * Flèches haut / bas : commande précédente ou suivante de l'historique.
 *
 * @param {number} sens - -1 (haut) ou +1 (bas).
 * @returns {string|null} - Texte à mettre dans le champ, null si l'historique est vide.
 */
C.handler_historique = function (sens) {
  if (!M.historique.length) {
    return null;
  }
  M.position = Math.max(0, Math.min(M.historique.length, M.position + sens));
  return M.historique[M.position] || "";
};

/**
 * Tab : complète le dernier mot (commande, puis fichier ou dossier).
 * Plusieurs possibilités : elles sont listées dans le terminal.
 *
 * @param {string} valeur - Contenu du champ.
 * @returns {string} - Nouveau contenu du champ.
 */
C.handler_completer = function (valeur) {
  let espace = valeur.lastIndexOf(" ");
  let mot = valeur.slice(espace + 1);
  let candidats;
  if (espace === -1) {
    candidats = C.commandes.noms();
  } else {
    let barre = mot.lastIndexOf("/");
    let base = barre === -1 ? "" : mot.slice(0, barre + 1);
    let dossier = FichiersData.lire(FichiersData.resoudre(base || ".", M.courant));
    if (!dossier || dossier.type !== "dir") {
      return valeur;
    }
    candidats = Object.keys(dossier.enfants).map((k) => base + k + (dossier.enfants[k].type === "dir" ? "/" : ""));
  }
  let trouves = candidats.filter((k) => k.startsWith(mot));
  if (trouves.length === 1) {
    return valeur.slice(0, espace + 1) + trouves[0];
  }
  if (trouves.length > 1) {
    C.sortie.ecrire(trouves.join("   "));
    V.rafraichir();
  }
  return valeur;
};

C.init = function (actions) {
  C.commandes = creerCommandes(M, C.sortie, actions);
  return V.init();
};

let V = {};

V.racine = null; // élément .terminal
V.affichees = 0; // lignes du modèle déjà dans la page

V.init = function () {
  let fragment = htmlToFragment(genericRenderer(template, { invite: V.invite() }));
  V.racine = fragment.firstElementChild;
  let puces = PUCES.map(function ([commande, libelle]) {
    let puce = htmlToFragment(genericRenderer(templatePuce, { commande, libelle }));
    puce.querySelector("button").addEventListener("click", function (e) {
      e.stopPropagation();
      C.handler_executer(commande);
    });
    return puce;
  });
  remplirSlot(fragment, "puces", puces);

  let champ = V.racine.querySelector(".terminal__saisie");
  V.racine.querySelector(".terminal__formulaire").addEventListener("submit", function (e) {
    e.preventDefault();
    let saisie = champ.value;
    champ.value = "";
    C.handler_executer(saisie);
  });
  champ.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      let texte = C.handler_historique(e.key === "ArrowUp" ? -1 : 1);
      if (texte !== null) {
        e.preventDefault();
        champ.value = texte;
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      champ.value = C.handler_completer(champ.value);
    }
  });
  V.rafraichir();
  let fenetre = FenetreView.dom({ id: "terminal", titre: "Terminal", modificateurContenu: "fenetre__contenu--terminal" }, fragment);
  // Un clic n'importe où dans la fenêtre donne la main au champ (ordinateur)
  fenetre.addEventListener("click", function () {
    if (!estMobile()) {
      champ.focus();
    }
  });
  return fenetre;
};

/**
 * Ajoute à la page les lignes nouvelles du modèle (la sortie est un journal :
 * on n'y réécrit pas ce qui est déjà lu par les lecteurs d'écran), ou la vide
 * après « clear ». Met l'invite à jour.
 */
V.rafraichir = function () {
  let sortie = V.racine.querySelector(".terminal__sortie");
  if (M.lignes.length < V.affichees) {
    sortie.replaceChildren();
    V.affichees = 0;
  }
  for (let ligne of M.lignes.slice(V.affichees)) {
    sortie.appendChild(V.createLigne(ligne));
  }
  V.affichees = M.lignes.length;
  sortie.scrollTop = sortie.scrollHeight;
  V.racine.querySelector(".terminal__invite").textContent = V.invite();
};

V.invite = function () {
  return `netrunner:${FichiersData.raccourcir(M.courant)}$`;
};

V.createLigne = function (ligne) {
  if (ligne.sorte === "entrees") {
    let fragment = htmlToFragment(templateEntrees);
    let entrees = ligne.entrees.map(function (entree) {
      let element = htmlToFragment(
        genericRenderer(templateEntree, { nom: entree.nom + (entree.dossier ? "/" : "") })
      ).firstElementChild;
      element.classList.toggle("terminal__entree--dossier", entree.dossier);
      return element;
    });
    remplirSlot(fragment, "entrees", entrees);
    return fragment;
  }
  let element = htmlToFragment(genericRenderer(templateLigne, { texte: ligne.texte })).firstElementChild;
  if (ligne.sorte !== "texte") {
    element.classList.add("terminal__ligne--" + ligne.sorte);
  }
  return element;
};

/**
 * @param {Object} actions - ouvrirFenetre, ouvrirFiche, basculerFilaire,
 *   choisirFond, reinitialiserFond, masquerTitre, telechargerCV.
 * @returns {HTMLElement}
 */
export function TerminalApplication(actions) {
  return C.init(actions);
}

/**
 * Champ de saisie : reçoit le focus à l'ouverture de la fenêtre (ordinateur).
 *
 * @returns {HTMLElement|null}
 */
export function champTerminal() {
  return V.racine ? V.racine.querySelector(".terminal__saisie") : null;
}
