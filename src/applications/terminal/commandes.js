import { FichiersData } from "../../data/fichiers.js";
import { ProjetsData } from "../../data/projets.js";
import { ProfilData } from "../../data/profil.js";
import { plusProche } from "../../lib/suggestion.js";

/**
 * Commandes du terminal (partie contrôleur).
 *
 * Chaque commande lit et modifie le modèle du terminal (dossier courant,
 * historique) et écrit ses résultats par la sortie reçue. Les effets sur le
 * reste du bureau (ouvrir une fenêtre, changer le fond…) passent par les
 * actions fournies par le bureau.
 */

const AIDE = [
  "ls [-a] [dossier]   lister le contenu",
  "cd [dossier]        changer de dossier (.., ~, /)",
  "pwd                 afficher le dossier courant",
  "cat <fichier>       lire un fichier",
  "tree                arborescence du dossier",
  "open <app|fichier> ouvrir une fenêtre ou une fiche (ex. open projets/maquettes/dr.md)",
  "cv                  télécharger mon CV (PDF)",
  "whoami, date, echo, history, clear, wireframe",
  "wallpaper [logo|reset]       changer le fond (ou glisser une image sur le bureau)",
  "wallpaper title on|off       afficher ou masquer le titre OMAR",
].join("\n");

// Nom tapé après « open » → fenêtre du bureau
const APPLIS = { about: "profil", projets: "projets", competences: "competences", contact: "contact", terminal: "terminal" };

/**
 * @param {{courant: string, historique: string[]}} M - Modèle du terminal.
 * @param {{ecrire: (texte: string, sorte?: string) => void,
 *          ecrireEntrees: (entrees: Array<{nom: string, dossier: boolean}>) => void,
 *          effacer: () => void}} sortie
 * @param {Object} actions - ouvrirFenetre, ouvrirFiche, basculerFilaire,
 *   choisirFond, reinitialiserFond, masquerTitre, telechargerCV.
 * @returns {{executer: (ligne: string) => boolean, noms: () => string[]}}
 */
export function creerCommandes(M, sortie, actions) {
  let { ecrire } = sortie;
  let resoudre = (saisie) => FichiersData.resoudre(saisie, M.courant);

  /** « Vouliez-vous dire cd projets ? » pour un chemin introuvable. */
  function suggererChemin(commande, saisie) {
    let a = (saisie || "").replace(/\/$/, "");
    let barre = a.lastIndexOf("/");
    let base = barre === -1 ? "" : a.slice(0, barre + 1);
    let proche = plusProche(a.slice(barre + 1), FichiersData.noms(resoudre(base || ".")));
    if (!proche && barre === -1) {
      proche = plusProche(a, FichiersData.noms(FichiersData.ACCUEIL));
      if (proche) {
        base = "~/";
      }
    }
    if (proche) {
      ecrire(`Vouliez-vous dire ${commande} ${base}${proche} ?`, "indice");
    }
  }

  /** Correction proposée pour une commande inconnue. */
  function suggererCommande(nom, args) {
    let suite = args.length ? " " + args.join(" ") : "";
    let nu = nom.replace(/\/$/, "");
    if (Object.prototype.hasOwnProperty.call(APPLIS, nu)) {
      return "open " + nu;
    }
    let appli = plusProche(nu, Object.keys(APPLIS));
    let ici = FichiersData.noms(M.courant);
    let accueil = FichiersData.noms(FichiersData.ACCUEIL);
    let fichier = plusProche(nu, ici) || plusProche(nu, accueil);
    if (fichier) {
      let dansIci = ici.includes(fichier);
      let noeud = FichiersData.lire(dansIci ? resoudre(fichier) : FichiersData.ACCUEIL + "/" + fichier);
      let reference = (dansIci ? "" : "~/") + fichier;
      return (noeud && noeud.type === "dir" ? "cd " : "cat ") + reference;
    }
    let commande = plusProche(nom, Object.keys(commandes));
    if (commande) {
      return commande + suite;
    }
    return appli ? "open " + appli : "";
  }

  function arbre(noeud, prefixe) {
    let noms = Object.keys(noeud.enfants)
      .filter((k) => k.charAt(0) !== ".")
      .sort();
    noms.forEach(function (nom, i) {
      let dernier = i === noms.length - 1;
      let estDossier = noeud.enfants[nom].type === "dir";
      ecrire(prefixe + (dernier ? "└── " : "├── ") + nom + (estDossier ? "/" : ""), estDossier ? "dossier" : "texte");
      if (estDossier) {
        arbre(noeud.enfants[nom], prefixe + (dernier ? "    " : "│   "));
      }
    });
  }

  let commandes = {
    help: function () {
      ecrire(AIDE);
    },
    ls: function (args) {
      let tout = args.includes("-a") || args.includes("-la");
      let cible = args.filter((a) => a.charAt(0) !== "-")[0];
      let noeud = FichiersData.lire(cible ? resoudre(cible) : M.courant);
      if (!noeud) {
        ecrire(`ls: ${cible} : aucun fichier ou dossier de ce type`, "erreur");
        return;
      }
      if (noeud.type === "file") {
        ecrire(cible);
        return;
      }
      let entrees = Object.keys(noeud.enfants)
        .sort()
        .filter((nom) => tout || nom.charAt(0) !== ".")
        .map((nom) => ({ nom, dossier: noeud.enfants[nom].type === "dir" }));
      sortie.ecrireEntrees(entrees);
    },
    cd: function (args) {
      let chemin = resoudre(args[0]);
      let noeud = FichiersData.lire(chemin);
      if (!noeud) {
        ecrire(`cd: ${args[0]} : aucun fichier ou dossier de ce type`, "erreur");
        suggererChemin("cd", args[0]);
        return;
      }
      if (noeud.type !== "dir") {
        ecrire(`cd: ${args[0]} : n'est pas un dossier`, "erreur");
        return;
      }
      M.courant = chemin;
    },
    pwd: function () {
      ecrire(M.courant);
    },
    cat: function (args) {
      if (!args[0]) {
        ecrire("cat: nom de fichier manquant", "erreur");
        return;
      }
      for (let a of args) {
        let noeud = FichiersData.lire(resoudre(a));
        if (!noeud) {
          ecrire(`cat: ${a} : aucun fichier ou dossier de ce type`, "erreur");
          suggererChemin("cat", a);
        } else if (noeud.type === "dir") {
          ecrire(`cat: ${a} : est un dossier`, "erreur");
        } else {
          ecrire(noeud.texte);
        }
      }
    },
    tree: function (args) {
      let chemin = args[0] ? resoudre(args[0]) : M.courant;
      let noeud = FichiersData.lire(chemin);
      if (!noeud || noeud.type !== "dir") {
        ecrire(`tree: ${args[0] || chemin} : dossier introuvable`, "erreur");
        return;
      }
      ecrire(FichiersData.raccourcir(chemin), "dossier");
      arbre(noeud, "");
    },
    open: function (args) {
      let saisie = args[0] || "";
      // Fichier de projet (« projets/sites/cc.md » ou « cc.md ») → sa fiche
      let base = saisie.split("/").pop();
      let projet = base.endsWith(".md") ? ProjetsData.lire(base.slice(0, -3)) : null;
      if (projet) {
        actions.ouvrirFiche(base.slice(0, -3));
        ecrire(`Ouverture de la fiche ${projet.nom}…`);
        return;
      }
      let nom = saisie.replace(/\/$/, "");
      let id = Object.prototype.hasOwnProperty.call(APPLIS, nom) ? APPLIS[nom] : null;
      if (!id) {
        ecrire(`open: ${saisie} : application inconnue. Essayez : about, projets, competences, contact`, "erreur");
        let proche = plusProche(nom, Object.keys(APPLIS));
        if (proche) {
          ecrire(`Vouliez-vous dire open ${proche} ?`, "indice");
        }
        return;
      }
      actions.ouvrirFenetre(id);
      ecrire(`Ouverture de ${saisie}…`);
    },
    cv: function () {
      let fichier = ProfilData.lire().cv;
      ecrire(`Téléchargement de ${fichier}…`);
      actions.telechargerCV();
    },
    whoami: function () {
      ecrire("netrunner");
    },
    date: function () {
      ecrire(new Date().toLocaleString("fr-FR"));
    },
    echo: function (args) {
      ecrire(args.join(" "));
    },
    history: function () {
      M.historique.forEach((ligne, i) => ecrire(String(i + 1).padStart(4, " ") + "  " + ligne));
    },
    clear: function () {
      sortie.effacer();
    },
    wireframe: function () {
      ecrire("Mode wireframe : " + (actions.basculerFilaire() ? "activé" : "désactivé"));
    },
    mkdir: function () {
      ecrire("mkdir: permission refusée (système en lecture seule)", "erreur");
    },
    touch: function () {
      ecrire("touch: permission refusée (système en lecture seule)", "erreur");
    },
    rm: function () {
      ecrire("rm: bien essayé. Système en lecture seule.", "erreur");
    },
    wallpaper: function (args) {
      if (args[0] === "reset") {
        actions.reinitialiserFond();
        ecrire("Fond d'écran par défaut restauré.");
        return;
      }
      if (args[0] === "title") {
        let masquer = args[1] === "off";
        actions.masquerTitre(masquer);
        ecrire("Titre OMAR " + (masquer ? "masqué : l'image de fond s'affiche nette." : "affiché."));
        return;
      }
      if (args[0] === "logo") {
        ecrire("Fond d'écran : écran-titre Omar");
        return;
      }
      actions.choisirFond();
      ecrire("Sélectionnez une image. Astuce : glissez-déposez une capture sur le bureau.");
    },
    sudo: function () {
      ecrire("netrunner n'est pas dans le fichier sudoers. Cet incident sera signalé.", "erreur");
    },
  };

  return {
    /**
     * Exécute une ligne déjà nettoyée et non vide.
     *
     * @param {string} ligne
     * @returns {boolean} - Faux si la commande est inconnue.
     */
    executer: function (ligne) {
      let args = ligne.split(/\s+/);
      let nom = args.shift().toLowerCase();
      if (Object.prototype.hasOwnProperty.call(commandes, nom)) {
        commandes[nom](args);
        return true;
      }
      ecrire(`${nom} : commande introuvable. Tapez help.`, "erreur");
      let correction = suggererCommande(nom, args);
      if (correction) {
        ecrire(`Vouliez-vous dire ${correction} ?`, "indice");
      }
      return false;
    },

    /**
     * Noms des commandes (complétion avec Tab).
     *
     * @returns {string[]}
     */
    noms: function () {
      return Object.keys(commandes);
    },
  };
}
