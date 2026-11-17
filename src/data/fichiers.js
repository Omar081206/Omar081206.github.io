import { ProjetsData } from "./projets.js";
import { CompetencesData } from "./competences.js";
import { ProfilData } from "./profil.js";

/**
 * Système de fichiers fictif du terminal, en lecture seule.
 *
 * Il est construit à partir des autres données : ajouter un projet dans
 * projets.js ajoute aussi son fichier projets/<dossier>/<clé>.md.
 *
 * Un nœud est { type: "file", texte } ou { type: "dir", enfants }.
 */

const ACCUEIL = "/home/netrunner";

function fichier(texte) {
  return { type: "file", texte };
}

function dossier(enfants) {
  return { type: "dir", enfants };
}

function construire() {
  let profil = ProfilData.lire();

  let projets = {};
  for (let categorie of ProjetsData.categories()) {
    let fichiers = {};
    for (let cle of categorie.projets) {
      let p = ProjetsData.lire(cle);
      fichiers[cle + ".md"] = fichier(
        `# ${p.nom}\n${p.badge} · ${p.type} · ${p.annee}\n${p.description}\nStack : ${p.technos.join(", ")}`
      );
    }
    projets[categorie.id] = dossier(fichiers);
  }

  let competences = CompetencesData.cles()
    .map(function (cle) {
      let c = CompetencesData.lire(cle);
      let noms = c.projets.map((p) => ProjetsData.lire(p).nom).join(", ");
      return (c.nom.toUpperCase() + "            ").slice(0, 12) + noms;
    })
    .join("\n");

  return dossier({
    home: dossier({
      netrunner: dossier({
        "about.txt": fichier(
          "Omar\nÉtudiant en 2e année de BUT MMI à Limoges, parcours développement web.\nAvant : bac spécialités mathématiques et NSI, 1re année de licence informatique à Saint-Charles (Marseille).\nBase : Marseille et Limoges, FR\nStatut : cherche un stage de 2e année, dès avril 2027\nMéthode : gestion de projet (Trello, Notion), veille technologique\nLangues : français, anglais (B2), arabe (bilingue)"
        ),
        "contact.txt": fichier(
          `MAIL      ${profil.mail}\nLINKEDIN  ${profil.linkedin.texte}\nGITHUB    ${profil.github.texte}`
        ),
        projets: dossier(projets),
        competences: dossier({ "skills.txt": fichier(competences) }),
        "credits.txt": fichier(
          "BRUITAGES  Cyberpunk 2077 (c) CD PROJEKT RED\nMUSIQUE    Cyberpunk 2077, thème du menu principal (c) CD PROJEKT RED\nŒuvre de fan non officielle, non approuvée par CD PROJEKT RED."
        ),
        ".secret": fichier("Wake up, netrunner. On a un portfolio à finir."),
      }),
    }),
  });
}

const RACINE = construire();

let FichiersData = {};

/** Dossier personnel : point de départ du terminal et sens de « ~ ». */
FichiersData.ACCUEIL = ACCUEIL;

/**
 * Chemin absolu à partir d'une saisie (relative, absolue ou avec ~).
 *
 * @param {string} saisie
 * @param {string} courant - Dossier courant.
 * @returns {string}
 */
FichiersData.resoudre = function (saisie, courant) {
  let p = saisie;
  if (!p || p === "~") {
    p = ACCUEIL;
  } else if (p.startsWith("~/")) {
    p = ACCUEIL + p.slice(1);
  }
  let morceaux = (p.charAt(0) === "/" ? p : courant + "/" + p).split("/");
  let pile = [];
  for (let m of morceaux) {
    if (!m || m === ".") {
      continue;
    }
    if (m === "..") {
      pile.pop();
    } else {
      pile.push(m);
    }
  }
  return "/" + pile.join("/");
};

/**
 * Nœud situé à un chemin absolu, ou null.
 *
 * @param {string} chemin
 * @returns {Object|null}
 */
FichiersData.lire = function (chemin) {
  let noeud = RACINE;
  for (let segment of chemin.split("/").filter(Boolean)) {
    if (noeud.type !== "dir" || !Object.prototype.hasOwnProperty.call(noeud.enfants, segment)) {
      return null;
    }
    noeud = noeud.enfants[segment];
  }
  return noeud;
};

/**
 * Chemin raccourci pour l'affichage : /home/netrunner/projets → ~/projets.
 *
 * @param {string} chemin
 * @returns {string}
 */
FichiersData.raccourcir = function (chemin) {
  if (chemin === ACCUEIL) {
    return "~";
  }
  return chemin.startsWith(ACCUEIL + "/") ? "~" + chemin.slice(ACCUEIL.length) : chemin;
};

/**
 * Noms visibles (sans fichiers cachés) d'un dossier, ou [] si ce n'en est pas un.
 *
 * @param {string} chemin
 * @returns {string[]}
 */
FichiersData.noms = function (chemin) {
  let noeud = FichiersData.lire(chemin);
  return noeud && noeud.type === "dir" ? Object.keys(noeud.enfants).filter((k) => k.charAt(0) !== ".") : [];
};

export { FichiersData };
