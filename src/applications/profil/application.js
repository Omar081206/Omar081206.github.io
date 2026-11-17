import { ProfilData } from "../../data/profil.js";
import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import template from "./template.html?raw";
import templateFait from "./fait.html?raw";
import "./style.css";

/**
 * Fenêtre « Profil ».
 *
 * Contenu fixe : pas d'état à faire évoluer, donc pas de M ni de C. La vue
 * signale seulement les clics sur les accès rapides.
 */

let V = {};

/**
 * @param {{surOuvrir: (id: string, bouton: HTMLElement) => void}} actions
 * @returns {DocumentFragment}
 */
V.createContenu = function (actions) {
  let profil = ProfilData.lire();
  let fragment = htmlToFragment(
    genericRenderer(template, {
      prenom: profil.prenom,
      presentation: profil.presentation,
      disponibilite: profil.disponibilite,
      cv: profil.cv,
    })
  );
  let faits = profil.faits.map((fait) => htmlToFragment(genericRenderer(templateFait, fait)));
  remplirSlot(fragment, "faits", faits);
  for (let bouton of fragment.querySelectorAll("[data-ouvrir]")) {
    bouton.addEventListener("click", () => actions.surOuvrir(bouton.getAttribute("data-ouvrir"), bouton));
  }
  return fragment;
};

/**
 * @param {{surOuvrir: (id: string, bouton: HTMLElement) => void}} actions
 * @returns {HTMLElement} - La fenêtre, à enregistrer auprès de lib/fenetres.js.
 */
export function ProfilApplication(actions) {
  return FenetreView.dom({ id: "profil", titre: "Profil" }, V.createContenu(actions));
}
