import { ReglagesData } from "../../data/reglages.js";
import { ProfilData } from "../../data/profil.js";
import { remplirSlot } from "../../lib/utils.js";
import { Son } from "../../lib/son.js";
import { Fenetres } from "../../lib/fenetres.js";
import { mouvementReduit } from "../../lib/medias.js";
import { releverFocus, rendreFocus } from "../../lib/focus.js";
import { BureauLayout } from "../../layouts/bureau/layout.js";
import { FondView } from "../../ui/fond/index.js";
import { AccueilView } from "../../ui/accueil/index.js";
import { AccueilMobileView } from "../../ui/accueil-mobile/index.js";
import { BarreMenuView } from "../../ui/barre-menu/index.js";
import { RaccourcisView } from "../../ui/raccourcis/index.js";
import { DockView } from "../../ui/dock/index.js";
import { ToastView } from "../../ui/toast/index.js";
import { HudView } from "../../ui/hud/index.js";
import { GuideView } from "../../ui/guide/index.js";

/**
 * Le bureau lui-même : fond d'écran, barre de menu (interrupteurs, heure),
 * icônes, barre des tâches, messages. Les fenêtres sont gérées par
 * lib/fenetres.js et créées par main.js.
 */

const RACCOURCIS = [
  { id: "profil", libelle: "Profil", icone: "i-user" },
  { id: "projets", libelle: "Projets", icone: "i-folder" },
  { id: "competences", libelle: "Compétences", icone: "i-chart" },
  { id: "contact", libelle: "Contact", icone: "i-mail" },
  { id: "terminal", libelle: "Terminal", icone: "i-term" },
];

const MESSAGES_REGLAGES = {
  son: ["Bruitages activés", "Bruitages désactivés"],
  musique: ["Musique d'ambiance activée", "Musique d'ambiance coupée"],
  glitch: ["Glitchs du titre activés", "Glitchs du titre désactivés"],
  animation: ["Animations du fond activées", "Animations du fond désactivées"],
};

let M = {
  reglages: null, // voir ReglagesData.lire()
  filaire: false, // mode wireframe (commande du terminal), non conservé
  maintenant: new Date(),
  guide: false, // bulle de bienvenue affichée
};

let C = {};

/**
 * Interrupteur de la barre de menu.
 *
 * @param {"son"|"musique"|"glitch"|"animation"} nom
 */
C.handler_reglage = function (nom) {
  let actif = !M.reglages[nom];
  M.reglages[nom] = actif;
  ReglagesData.ecrireInterrupteur(nom, actif);
  if (nom === "son") {
    Son.activer(actif);
  } else if (nom === "musique") {
    Son.activerMusique(actif);
  }
  V.rafraichir();
  C.afficherMessage(MESSAGES_REGLAGES[nom][actif ? 0 : 1]);
};

/**
 * Image choisie ou déposée par le visiteur : devient le fond d'écran.
 *
 * @param {File} fichier
 */
C.handler_fichierFond = function (fichier) {
  if (!fichier || !/^image\//.test(fichier.type)) {
    C.afficherMessage("Choisissez un fichier image");
    return;
  }
  let lecteur = new FileReader();
  lecteur.onload = function () {
    M.reglages.fond = lecteur.result;
    let garde = ReglagesData.ecrireFond(lecteur.result);
    V.rafraichir();
    C.afficherMessage(
      (garde ? "Fond d'écran appliqué" : "Fond appliqué pour cette session") +
        ". Terminal : wallpaper title off pour l'afficher net"
    );
  };
  lecteur.readAsDataURL(fichier);
};

/** Bouton NOS de la barre des tâches : affiche ou masque la bulle d'aide. */
C.handler_basculerGuide = function () {
  M.guide = !M.guide;
  if (!M.guide) {
    ReglagesData.noterGuideVu();
  }
  V.rafraichirGuide(M.guide);
};

/** « Compris » : la bulle se ferme et ne revient pas pendant la visite. */
C.handler_fermerGuide = function () {
  M.guide = false;
  ReglagesData.noterGuideVu();
  V.rafraichirGuide(true);
};

/**
 * « Voir mes projets » depuis la bulle.
 *
 * @param {HTMLElement} bouton
 */
C.handler_guideProjets = function (bouton) {
  M.guide = false;
  ReglagesData.noterGuideVu();
  V.rafraichirGuide(false);
  C.surOuvrir("projets", bouton);
};

/** Une fenêtre s'ouvre : le visiteur a compris, la bulle s'efface. */
C.fenetreOuverte = function () {
  if (M.guide) {
    M.guide = false;
    ReglagesData.noterGuideVu();
    V.rafraichirGuide(false);
  }
};

C.handler_tic = function () {
  M.maintenant = new Date();
  V.rafraichirHeure();
};

/**
 * @param {string} texte
 */
C.afficherMessage = function (texte) {
  ToastView.afficher(V.toast, texte);
};

/** Actions offertes au terminal et aux autres applications. */
C.publiques = {
  afficherMessage: (texte) => C.afficherMessage(texte),
  basculerFilaire: function () {
    M.filaire = !M.filaire;
    V.rafraichir();
    return M.filaire;
  },
  choisirFond: () => FondView.choisirFichier(V.fond),
  reinitialiserFond: function () {
    M.reglages.fond = "";
    ReglagesData.ecrireFond("");
    V.rafraichir();
  },
  masquerTitre: function (masquer) {
    M.reglages.titreMasque = masquer;
    ReglagesData.ecrireTitreMasque(masquer);
    V.rafraichir();
  },
};

/**
 * @param {{surOuvrir: (id: string, declencheur: HTMLElement) => void}} actions
 * @returns {{fragment: DocumentFragment, bureau: HTMLElement, navigation: HTMLElement}}
 */
C.init = function (actions) {
  M.reglages = ReglagesData.lire();
  M.guide = !M.reglages.guideVu;
  Son.configurer({ son: M.reglages.son, musique: M.reglages.musique });
  C.surOuvrir = actions.surOuvrir;
  let vue = V.init();
  setInterval(C.handler_tic, 30000);
  Fenetres.surChangement(V.rafraichirFenetres);
  return vue;
};

let V = {};

V.ecran = null;
V.fond = null;
V.barreMenu = null;
V.accueilMobile = null;
V.dock = null;
V.toast = null;
V.guide = null;

V.init = function () {
  let fragment = BureauLayout();
  V.ecran = fragment.querySelector(".ecran");

  let accueil = AccueilView.dom({ accroche: ProfilData.lire().accroche }, { surOuvrir: C.surOuvrir });
  remplirSlot(fragment, "fond", FondView.dom(V.donneesFond(), accueil, { surFichier: C.handler_fichierFond }));
  V.fond = V.ecran.querySelector(".fond");

  remplirSlot(fragment, "barre-menu", V.createBarreMenu());
  V.barreMenu = V.ecran.querySelector(".barre-menu");

  remplirSlot(fragment, "accueil-mobile", V.createAccueilMobile());
  V.accueilMobile = V.ecran.querySelector(".accueil-mobile");

  remplirSlot(fragment, "raccourcis", RaccourcisView.dom(RACCOURCIS, { surOuvrir: C.surOuvrir }));

  V.toast = ToastView.dom();
  remplirSlot(fragment, "toast", V.toast);

  remplirSlot(fragment, "guide", GuideView.dom({ surProjets: C.handler_guideProjets, surFermer: C.handler_fermerGuide }));
  V.guide = V.ecran.querySelector(".guide");

  remplirSlot(fragment, "dock", V.createDock([]));
  V.dock = V.ecran.querySelector(".dock");

  remplirSlot(fragment, "hud", HudView.dom());

  V.brancherDepot();
  V.lancerGlitch();
  V.appliquerModificateurs();
  V.rafraichirGuide(false);

  return {
    fragment,
    bureau: V.ecran.querySelector(".bureau"),
    navigation: V.ecran.querySelector(".bureau__navigation"),
  };
};

/** Met à jour tout ce qui dépend des réglages. */
V.rafraichir = function () {
  V.appliquerModificateurs();
  FondView.appliquer(V.fond, V.donneesFond());
  V.rafraichirBarreMenu();
};

V.appliquerModificateurs = function () {
  V.ecran.classList.toggle("ecran--filaire", M.filaire);
  V.ecran.classList.toggle("ecran--sans-glitch", !M.reglages.glitch);
  V.ecran.classList.toggle("ecran--sans-animation", !M.reglages.animation);
};

V.donneesFond = function () {
  return { image: M.reglages.fond, titreMasque: M.reglages.titreMasque };
};

V.heure = function () {
  return M.maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

V.createBarreMenu = function () {
  let active = Fenetres.active();
  return BarreMenuView.dom(
    { appli: active ? active.titre : "Bureau", heure: V.heure(), reglages: M.reglages },
    {
      surMarque: (bouton) => C.surOuvrir("profil", bouton),
      surReglage: C.handler_reglage,
    }
  );
};

V.rafraichirBarreMenu = function () {
  let focus = releverFocus(V.barreMenu);
  let fragment = V.createBarreMenu();
  let nouvelle = fragment.firstElementChild;
  V.barreMenu.replaceWith(fragment);
  V.barreMenu = nouvelle;
  rendreFocus(V.barreMenu, focus);
};

V.createAccueilMobile = function () {
  return AccueilMobileView.dom({
    heure: V.heure(),
    date: M.maintenant.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    accroche: ProfilData.lire().accroche,
  });
};

V.rafraichirHeure = function () {
  V.rafraichirBarreMenu();
  let fragment = V.createAccueilMobile();
  let nouvel = fragment.firstElementChild;
  V.accueilMobile.replaceWith(fragment);
  V.accueilMobile = nouvel;
};

/** Barre des tâches et nom de l'appli active, après chaque changement de fenêtre. */
V.rafraichirFenetres = function () {
  let liste = Fenetres.liste();
  let focusDock = document.activeElement && document.activeElement.closest(".dock")
    ? document.activeElement.getAttribute("data-dock")
    : null;
  if (liste.some((f) => f.ouverte)) {
    C.fenetreOuverte();
  }
  let fragment = V.createDock(liste);
  let nouveau = fragment.firstElementChild;
  V.dock.replaceWith(fragment);
  V.dock = nouveau;
  if (focusDock) {
    let bouton = V.dock.querySelector(`[data-dock="${focusDock}"]`);
    if (bouton) {
      bouton.focus({ preventScroll: true });
    }
  }
  V.ecran.classList.toggle("ecran--dock-visible", liste.some((f) => f.presente));
  V.rafraichirBarreMenu();
};

V.createDock = function (liste) {
  return DockView.dom(liste, { surClic: Fenetres.basculerDepuisDock, surDemarrer: C.handler_basculerGuide }, RACCOURCIS, M.guide);
};

/**
 * Affiche ou masque la bulle d'aide et met à jour le bouton NOS.
 *
 * @param {boolean} deplacerFocus - Vrai quand le focus doit suivre (ouverture,
 *   ou fermeture par un bouton de la bulle qui va disparaître).
 */
V.rafraichirGuide = function (deplacerFocus) {
  let avaitFocus = V.guide.contains(document.activeElement);
  V.guide.hidden = !M.guide;
  V.ecran.classList.toggle("ecran--guide", M.guide);
  let demarrer = V.dock && V.dock.querySelector(".dock__demarrer");
  if (demarrer) {
    demarrer.setAttribute("aria-expanded", M.guide ? "true" : "false");
  }
  if (!deplacerFocus) {
    return;
  }
  if (M.guide) {
    V.guide.querySelector(".guide__bouton--principal").focus({ preventScroll: true });
  } else if (avaitFocus) {
    let icone = V.ecran.querySelector(".raccourcis__bouton");
    if (icone) {
      icone.focus({ preventScroll: true });
    }
  }
};

/** Glisser-déposer d'une image sur l'écran : nouveau fond. */
V.brancherDepot = function () {
  let indication = V.ecran.querySelector(".ecran__depot");
  let profondeur = 0;
  V.ecran.addEventListener("dragenter", function (e) {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")) {
      profondeur += 1;
      indication.hidden = false;
    }
  });
  V.ecran.addEventListener("dragleave", function () {
    profondeur = Math.max(0, profondeur - 1);
    if (!profondeur) {
      indication.hidden = true;
    }
  });
  V.ecran.addEventListener("dragover", (e) => e.preventDefault());
  V.ecran.addEventListener("drop", function (e) {
    e.preventDefault();
    profondeur = 0;
    indication.hidden = true;
    if (e.dataTransfer.files.length) {
      C.handler_fichierFond(e.dataTransfer.files[0]);
    }
  });
};

/** Glitch du titre toutes les 10 à 30 s (premier après 3 à 7 s). */
V.lancerGlitch = function () {
  if (mouvementReduit()) {
    return;
  }
  let titre = V.fond.querySelector(".titre-omar");
  let suivant = function () {
    setTimeout(suivant, 10000 + Math.random() * 20000);
    if (M.reglages.glitch) {
      AccueilView.glitcher(titre);
    }
  };
  setTimeout(suivant, 3000 + Math.random() * 4000);
};

/**
 * Actions du bureau offertes aux applications.
 */
export let BureauActions = C.publiques;

/**
 * @param {{surOuvrir: (id: string, declencheur: HTMLElement) => void}} actions
 * @returns {{fragment: DocumentFragment, bureau: HTMLElement, navigation: HTMLElement}}
 */
export function BureauApplication(actions) {
  return C.init(actions);
}
