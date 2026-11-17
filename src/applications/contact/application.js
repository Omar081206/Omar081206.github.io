import { ProfilData } from "../../data/profil.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { copierTexte } from "../../lib/navigateur.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Fenêtre « Contact » : coordonnées, copie de l'adresse mail, CV.
 */

let M = {
  profil: null,
};

let C = {};

C.afficherMessage = null; // fourni par le bureau (toast)

/** Copie l'adresse mail et prévient le visiteur du résultat. */
C.handler_copier = async function () {
  let adresse = M.profil.mail;
  if (await copierTexte(adresse)) {
    C.afficherMessage("Adresse copiée : " + adresse);
  } else {
    C.afficherMessage("Copie impossible : sélectionnez l'adresse et copiez-la à la main (Ctrl+C).");
  }
};

C.init = function (actions) {
  M.profil = ProfilData.lire();
  C.afficherMessage = actions.afficherMessage;
  return V.init();
};

let V = {};

V.init = function () {
  return FenetreView.dom({ id: "contact", titre: "Contact" }, V.createContenu());
};

V.createContenu = function () {
  let p = M.profil;
  let fragment = htmlToFragment(
    genericRenderer(template, {
      mail: p.mail,
      linkedinUrl: p.linkedin.url,
      linkedinTexte: p.linkedin.texte,
      githubUrl: p.github.url,
      githubTexte: p.github.texte,
      cv: p.cv,
      credits: p.credits,
    })
  );
  fragment.querySelector('[data-action="copier"]').addEventListener("click", C.handler_copier);
  return fragment;
};

/**
 * @param {{afficherMessage: (texte: string) => void}} actions
 * @returns {HTMLElement}
 */
export function ContactApplication(actions) {
  return C.init(actions);
}
