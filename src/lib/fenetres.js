import { Son } from "./son.js";
import { dechiffrer } from "./texte.js";
import { estMobile, mouvementReduit } from "./medias.js";
import { estVisible } from "./focus.js";

/**
 * Gestionnaire de fenêtres du bureau (l'équivalent du routeur d'une SPA).
 *
 * Il connaît toutes les fenêtres, leur état (fermée, ouverte, réduite), leur
 * ordre d'empilement et la fenêtre active. Il gère l'ouverture et la fermeture
 * (son, animation, placement, focus clavier), le déplacement à la souris,
 * l'agrandissement et le bouton « retour » du téléphone.
 *
 * Il ne dessine rien d'autre que les fenêtres : la barre des tâches et le nom
 * de l'appli active s'abonnent à ses changements (Fenetres.surChangement).
 */

const DECALAGE_FENETRE = 28;
const DECALAGE_FICHE = 36;
const CASCADE = 5;

let bureau = null;
let ancreFenetres = null;
let fenetres = []; // { id, element, titre, icone, largeur, fiche, etat, declencheur, decalage, cibleFocus, surTouche, surFermeture }
let idActive = null;
let zSommet = 10;
let ecouteurs = [];
let interceptionRetour = null;
let gardeHistorique = false;
let ignorerRetour = false;
let compteurFiches = 0;

function trouver(id) {
  return fenetres.find((f) => f.id === id) || null;
}

function prevenir() {
  for (let fn of ecouteurs) {
    fn();
  }
}

function ouvertes() {
  return fenetres.filter((f) => f.etat === "ouverte");
}

/**
 * Fenêtre ouverte la plus haute dans l'empilement.
 *
 * @returns {Object|null}
 */
function dessus() {
  let haut = null;
  let z = -1;
  for (let f of ouvertes()) {
    let fz = parseInt(f.element.style.zIndex, 10) || 0;
    if (fz >= z) {
      z = fz;
      haut = f;
    }
  }
  return haut;
}

function activer(f) {
  idActive = f.id;
  for (let autre of fenetres) {
    autre.element.classList.toggle("fenetre--active", autre === f);
  }
  zSommet += 1;
  f.element.style.zIndex = zSommet;
  prevenir();
}

/** Après une fermeture : la dernière fenêtre ouverte devient active. */
function activerDerniere() {
  let liste = ouvertes();
  if (liste.length) {
    activer(liste[liste.length - 1]);
  } else {
    idActive = null;
    for (let f of fenetres) {
      f.element.classList.remove("fenetre--active");
    }
    prevenir();
  }
}

function changerEtat(f, etat) {
  f.etat = etat;
  f.element.setAttribute("data-etat", etat);
  f.element.hidden = etat !== "ouverte";
  prevenir();
  synchroniserHistorique();
}

/**
 * Téléphone : une entrée d'historique tant qu'une fenêtre est ouverte,
 * pour que le bouton « retour » ferme la fenêtre au lieu de quitter le site.
 */
function synchroniserHistorique() {
  let une = !!dessus();
  if (une && !gardeHistorique && estMobile()) {
    history.pushState({ nos: 1 }, "");
    gardeHistorique = true;
  } else if (!une && gardeHistorique) {
    gardeHistorique = false;
    ignorerRetour = true;
    history.back();
  }
}

window.addEventListener("popstate", function () {
  if (ignorerRetour) {
    ignorerRetour = false;
    return;
  }
  if (!gardeHistorique) {
    return;
  }
  gardeHistorique = false;
  if (interceptionRetour && interceptionRetour()) {
    synchroniserHistorique();
    return;
  }
  let haut = dessus();
  if (haut) {
    Fenetres.fermer(haut.id);
  }
});

/**
 * Ordinateur : fenêtre centrée dans l'espace libre à droite des icônes du
 * bureau, au-dessus de la barre des tâches, en cascade.
 */
function placer(f) {
  let el = f.element;
  if (estMobile() || el.classList.contains("fenetre--agrandie")) {
    return;
  }
  let rectBureau = bureau.getBoundingClientRect();
  let icones = bureau.querySelector(".raccourcis");
  let marge = icones ? Math.max(0, icones.getBoundingClientRect().right - rectBureau.left + 8) : 0;
  let largeurLibre = Math.max(320, bureau.clientWidth - marge);
  let hauteurLibre = bureau.clientHeight - 66;
  let largeur = Math.min(f.largeur, largeurLibre - 24);
  el.style.width = largeur + "px";
  let hauteur = el.offsetHeight;

  let pas;
  let pasMax;
  if (f.fiche) {
    pas = f.decalage;
    pasMax = (CASCADE - 1) * DECALAGE_FICHE;
  } else {
    let n = ouvertes().filter((o) => o !== f && !o.fiche).length;
    pas = (n % CASCADE) * DECALAGE_FENETRE;
    pasMax = (CASCADE - 1) * DECALAGE_FENETRE;
  }
  // Fenêtre haute : on resserre le décalage vertical pour qu'elle ne sorte pas de l'écran
  let placeVerticale = Math.max(0, hauteurLibre - hauteur - 8);
  let reduction = Math.min(1, placeVerticale / pasMax);
  let pasVertical = Math.round(pas * reduction);
  let gauche = Math.round((largeurLibre - largeur) / 2) + pas;
  let haut =
    Math.round(Math.max(8, Math.min((hauteurLibre - hauteur) / 2, hauteurLibre - hauteur - Math.round(pasMax * reduction)))) +
    pasVertical;
  gauche = marge + Math.max(12, Math.min(gauche, largeurLibre - largeur - 12));
  haut = Math.max(8, Math.min(haut, Math.max(8, hauteurLibre - hauteur)));
  el.style.left = gauche + "px";
  el.style.top = haut + "px";
}

/** Focus clavier dans la fenêtre qui s'ouvre. */
function focaliserDans(f) {
  let cible = (f.cibleFocus && !estMobile() && f.cibleFocus()) || f.element.querySelector(".fenetre__titre");
  if (cible) {
    cible.focus({ preventScroll: true });
  }
}

/** Focus clavier rendu au bouton qui avait ouvert la fenêtre. */
function rendreFocus(f) {
  let el = f.declencheur;
  f.declencheur = null;
  // Le bouton a pu être redessiné entre-temps (barre des tâches, vue
  // reconstruite) : on cherche son remplaçant.
  if (el && !el.isConnected) {
    if (el.hasAttribute("data-dock")) {
      el = document.querySelector(`[data-dock="${el.getAttribute("data-dock")}"]`);
    } else if (el.hasAttribute("data-focus")) {
      el = document.querySelector(`[data-focus="${CSS.escape(el.getAttribute("data-focus"))}"]`);
    }
  }
  if (estVisible(el)) {
    el.focus({ preventScroll: true });
    return;
  }
  let haut = dessus();
  if (haut) {
    focaliserDans(haut);
    return;
  }
  let raccourci = document.querySelector(`.raccourcis__bouton[data-ouvrir="${f.id}"]`);
  if (estVisible(raccourci)) {
    raccourci.focus({ preventScroll: true });
  }
}

/** Déplacement à la souris par la barre de titre (ordinateur seulement). */
function rendreDeplacable(f) {
  let el = f.element;
  let barre = el.querySelector(".fenetre__barre");
  let ecartX = 0;
  let ecartY = 0;
  let enCours = false;

  barre.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button") || estMobile() || el.classList.contains("fenetre--agrandie")) {
      return;
    }
    let r = el.getBoundingClientRect();
    ecartX = e.clientX - r.left;
    ecartY = e.clientY - r.top;
    enCours = true;
    barre.setPointerCapture(e.pointerId);
  });
  barre.addEventListener("pointermove", function (e) {
    if (!enCours) {
      return;
    }
    let d = bureau.getBoundingClientRect();
    let x = Math.min(Math.max(e.clientX - d.left - ecartX, 120 - el.offsetWidth), d.width - 120);
    let y = Math.min(Math.max(e.clientY - d.top - ecartY, 0), d.height - 48);
    el.style.left = x + "px";
    el.style.top = y + "px";
  });
  let arreter = () => {
    enCours = false;
  };
  barre.addEventListener("pointerup", arreter);
  barre.addEventListener("pointercancel", arreter);
  barre.addEventListener("dblclick", function (e) {
    if (!e.target.closest("button") && !estMobile()) {
      Fenetres.basculerAgrandie(f.id);
    }
  });
}

let Fenetres = {};

/**
 * @param {HTMLElement} elementBureau - Zone où vivent les fenêtres (.bureau).
 * @param {HTMLElement} ancre - Les fenêtres sont insérées avant cet élément
 *   (la barre des tâches), pour garder l'ordre de tabulation.
 */
Fenetres.initialiser = function (elementBureau, ancre) {
  bureau = elementBureau;
  ancreFenetres = ancre;
};

/**
 * Ajoute une fenêtre au bureau (fermée) et branche ses commandes.
 *
 * @param {HTMLElement} element - Racine .fenetre, avec un id et data-titre.
 * @param {{icone: string, largeur: number, fiche?: boolean,
 *          cibleFocus?: () => HTMLElement|null,
 *          surTouche?: (e: KeyboardEvent) => boolean,
 *          surFermeture?: () => void}} options
 *   cibleFocus : élément à focaliser à l'ouverture (par défaut le titre) ;
 *   surTouche : raccourcis clavier quand la fenêtre est active ;
 *   surFermeture : appelé quand une fiche est retirée du bureau.
 */
Fenetres.enregistrer = function (element, options) {
  let f = {
    id: element.id,
    element,
    titre: element.getAttribute("data-titre"),
    icone: options.icone,
    largeur: options.largeur,
    fiche: !!options.fiche,
    cibleFocus: options.cibleFocus || null,
    surTouche: options.surTouche || null,
    surFermeture: options.surFermeture || null,
    decalage: 0,
    etat: "fermee",
    declencheur: null,
  };
  if (f.fiche) {
    f.decalage = (compteurFiches++ % CASCADE) * DECALAGE_FICHE;
  }
  // Position de départ, remplacée par placer() à l'ouverture sur ordinateur
  element.style.left = "48px";
  element.style.top = "28px";
  element.style.width = f.largeur + "px";
  element.setAttribute("data-etat", "fermee");
  element.hidden = true;
  bureau.insertBefore(element, ancreFenetres);
  fenetres.push(f);

  element.addEventListener("pointerdown", () => activer(f));
  for (let bouton of element.querySelectorAll("[data-commande]")) {
    bouton.addEventListener("click", function () {
      let commande = bouton.getAttribute("data-commande");
      if (commande === "fermer") {
        Fenetres.fermer(f.id);
      } else if (commande === "reduire") {
        Fenetres.reduire(f.id);
      } else if (commande === "agrandir") {
        Fenetres.basculerAgrandie(f.id);
      }
    });
  }
  rendreDeplacable(f);
  prevenir();
};

/**
 * Ouvre (ou ramène au premier plan) une fenêtre.
 *
 * @param {string} id
 * @param {HTMLElement|null} [declencheur] - Bouton qui a demandé l'ouverture,
 *   pour lui rendre le focus à la fermeture.
 */
Fenetres.ouvrir = function (id, declencheur) {
  let f = trouver(id);
  if (!f) {
    return;
  }
  let dejaOuverte = f.etat === "ouverte";
  let etaitFermee = f.etat === "fermee";
  if (!dejaOuverte) {
    Son.jouer("open");
    let origine = declencheur || document.activeElement;
    f.declencheur = origine && origine !== document.body && !f.element.contains(origine) ? origine : null;
  }
  changerEtat(f, "ouverte");
  if (etaitFermee) {
    placer(f);
  }
  activer(f);
  focaliserDans(f);
  if (!dejaOuverte && !mouvementReduit()) {
    f.element.classList.remove("fenetre--allumage");
    void f.element.offsetWidth; // relance l'animation
    f.element.classList.add("fenetre--allumage");
    dechiffrer(f.element.querySelector(".fenetre__titre"), f.titre);
  }
};

/**
 * Ferme une fenêtre. Une fiche projet est retirée du bureau.
 *
 * @param {string} id
 */
Fenetres.fermer = function (id) {
  let f = trouver(id);
  if (!f) {
    return;
  }
  Son.jouer("close");
  changerEtat(f, "fermee");
  if (f.fiche) {
    // Retrait au tour suivant : le clic en cours finit sur un élément encore présent.
    setTimeout(function () {
      f.element.remove();
      fenetres = fenetres.filter((o) => o !== f);
      if (f.surFermeture) {
        f.surFermeture();
      }
      prevenir();
    }, 0);
  }
  activerDerniere();
  rendreFocus(f);
};

/**
 * Réduit une fenêtre dans la barre des tâches.
 *
 * @param {string} id
 */
Fenetres.reduire = function (id) {
  let f = trouver(id);
  if (!f) {
    return;
  }
  changerEtat(f, "reduite");
  activerDerniere();
  rendreFocus(f);
};

/**
 * Agrandit une fenêtre à tout le bureau, ou lui rend sa taille.
 *
 * @param {string} id
 */
Fenetres.basculerAgrandie = function (id) {
  let f = trouver(id);
  if (f) {
    f.element.classList.toggle("fenetre--agrandie");
  }
};

/**
 * Clic dans la barre des tâches : réduit la fenêtre si elle est déjà au
 * premier plan, sinon l'ouvre.
 *
 * @param {string} id
 * @param {HTMLElement} bouton
 */
Fenetres.basculerDepuisDock = function (id, bouton) {
  let f = trouver(id);
  if (!f) {
    return;
  }
  if (f.etat === "ouverte" && f.id === idActive) {
    Fenetres.reduire(id);
  } else {
    Fenetres.ouvrir(id, bouton);
  }
};

/**
 * Fenêtre active (ouverte et au premier plan), ou null.
 *
 * @returns {{id: string, titre: string, element: HTMLElement, fiche: boolean,
 *            surTouche: ((e: KeyboardEvent) => boolean)|null}|null}
 */
Fenetres.active = function () {
  let f = trouver(idActive);
  return f && f.etat === "ouverte" ? f : null;
};

/**
 * Identifiant de la fenêtre ouverte la plus haute, ou null.
 *
 * @returns {string|null}
 */
Fenetres.dessus = function () {
  let f = dessus();
  return f ? f.id : null;
};

/**
 * Vrai si la fenêtre existe (une fiche fermée n'existe plus).
 *
 * @param {string} id
 * @returns {boolean}
 */
Fenetres.existe = function (id) {
  return !!trouver(id);
};

/**
 * État de toutes les fenêtres, pour la barre des tâches.
 *
 * @returns {Array<{id: string, titre: string, icone: string, fiche: boolean,
 *                  presente: boolean, ouverte: boolean}>}
 */
Fenetres.liste = function () {
  return fenetres.map((f) => ({
    id: f.id,
    titre: f.titre,
    icone: f.icone,
    fiche: f.fiche,
    presente: f.etat !== "fermee",
    ouverte: f.etat === "ouverte",
  }));
};

/**
 * Appelle fn après chaque changement (ouverture, fermeture, fenêtre active…).
 *
 * @param {() => void} fn
 */
Fenetres.surChangement = function (fn) {
  ecouteurs.push(fn);
};

/**
 * Bouton « retour » du téléphone : fn est essayée avant de fermer la fenêtre
 * du dessus. Si elle renvoie vrai, le retour est considéré comme traité.
 *
 * @param {() => boolean} fn
 */
Fenetres.intercepterRetour = function (fn) {
  interceptionRetour = fn;
};

export { Fenetres };
