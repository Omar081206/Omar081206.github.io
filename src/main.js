import "./styles/variables.css";
import "./styles/base.css";
import "./styles/animations.css";
import "./styles/blocs-communs.css";

import { ProjetsData } from "./data/projets.js";
import { ProfilData } from "./data/profil.js";
import { ReglagesData } from "./data/reglages.js";
import { remplirSlot } from "./lib/utils.js";
import { Fenetres } from "./lib/fenetres.js";
import { Son } from "./lib/son.js";
import { telecharger } from "./lib/navigateur.js";
import { BureauApplication, BureauActions } from "./applications/bureau/application.js";
import { DemarrageApplication, demarrageEnCours } from "./applications/demarrage/application.js";
import { ProfilApplication } from "./applications/profil/application.js";
import { ProjetsApplication, ProjetsActions } from "./applications/projets/application.js";
import { CompetencesApplication, CompetencesActions } from "./applications/competences/application.js";
import { ContactApplication } from "./applications/contact/application.js";
import { TerminalApplication, champTerminal } from "./applications/terminal/application.js";
import { FicheProjetApplication } from "./applications/fiche-projet/application.js";
import { VisionneuseApplication, VisionneuseActions } from "./applications/visionneuse/application.js";

/**
 * Point d'entrée : monte le bureau, crée les fenêtres et branche les
 * raccourcis clavier globaux.
 */

/**
 * @param {string} id - Fenêtre à ouvrir.
 * @param {HTMLElement|null} [declencheur]
 */
function ouvrir(id, declencheur) {
  Fenetres.ouvrir(id, declencheur);
}

/**
 * Ouvre la fiche d'un projet, en la créant au premier appel.
 *
 * @param {string} cle
 * @param {HTMLElement|null} [declencheur]
 */
function ouvrirFiche(cle, declencheur) {
  let id = "fiche-" + cle;
  if (!Fenetres.existe(id)) {
    let fiche = FicheProjetApplication(cle, {
      afficherMessage: BureauActions.afficherMessage,
      agrandir: VisionneuseActions.ouvrir,
    });
    Fenetres.enregistrer(fiche.element, {
      icone: ProjetsData.lire(cle).icone,
      largeur: 780,
      fiche: true,
      surTouche: fiche.surTouche,
    });
  }
  Fenetres.ouvrir(id, declencheur);
}

/**
 * Explorateur de projets, filtré sur une compétence si elle est donnée.
 *
 * @param {string|null} competence
 * @param {HTMLElement|null} declencheur
 */
function explorer(competence, declencheur) {
  if (competence) {
    ProjetsActions.filtrer(competence);
  }
  ouvrir("projets", declencheur);
}

// Bureau et écrans globaux
let vue = BureauApplication({ surOuvrir: ouvrir });
remplirSlot(vue.fragment, "visionneuse", VisionneuseApplication());
remplirSlot(
  vue.fragment,
  "demarrage",
  DemarrageApplication({
    dejaVu: ReglagesData.lire().demarrageVu,
    surFin: function () {
      ReglagesData.noterDemarrageVu();
      Son.jouer("boot");
    },
  })
);
document.getElementById("app").replaceChildren(vue.fragment);
Fenetres.initialiser(vue.bureau, vue.navigation);

// Fenêtres des applications (l'ordre est celui de la barre des tâches)
Fenetres.enregistrer(ProfilApplication({ surOuvrir: ouvrir }), { icone: "i-user", largeur: 700 });
Fenetres.enregistrer(ProjetsApplication({ ouvrirFiche, afficherMessage: BureauActions.afficherMessage }), {
  icone: "i-folder",
  largeur: 840,
  surTouche: ProjetsActions.surTouche,
});
Fenetres.enregistrer(CompetencesApplication({ ouvrirFiche, explorer }), {
  icone: "i-chart",
  largeur: 780,
  surTouche: CompetencesActions.surTouche,
});
Fenetres.enregistrer(ContactApplication({ afficherMessage: BureauActions.afficherMessage }), {
  icone: "i-mail",
  largeur: 420,
});
Fenetres.enregistrer(
  TerminalApplication({
    ouvrirFenetre: (id) => ouvrir(id, null),
    ouvrirFiche: (cle) => ouvrirFiche(cle, null),
    basculerFilaire: BureauActions.basculerFilaire,
    choisirFond: BureauActions.choisirFond,
    reinitialiserFond: BureauActions.reinitialiserFond,
    masquerTitre: BureauActions.masquerTitre,
    telechargerCV: () => telecharger(ProfilData.lire().cv),
  }),
  { icone: "i-term", largeur: 500, cibleFocus: champTerminal }
);

// Bouton « retour » du téléphone : ferme d'abord la visionneuse si elle est ouverte
Fenetres.intercepterRetour(VisionneuseActions.fermer);

// Raccourcis de la fenêtre active (F, G, Entrée…), hors champ de saisie
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || demarrageEnCours()) {
    return;
  }
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }
  let active = Fenetres.active();
  if (active && active.surTouche && active.surTouche(e)) {
    e.preventDefault();
  }
});

// Échap : ferme la fenêtre du dessus (la visionneuse gère son propre Échap)
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape" || e.ctrlKey || e.metaKey || e.altKey || demarrageEnCours()) {
    return;
  }
  let dessus = Fenetres.dessus();
  if (dessus) {
    e.preventDefault();
    Fenetres.fermer(dessus);
  }
});
