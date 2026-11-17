import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

// Bulle de bienvenue (ordinateur), à droite des icônes : explique en une phrase
// que le site est un bureau d'ordinateur. Une fois par visite ; bouton NOS pour la rouvrir.
let GuideView = {
  /**
   * @param {{surProjets: (bouton: HTMLElement) => void, surFermer: () => void}} actions
   * @returns {DocumentFragment}
   */
  dom: function (actions) {
    let fragment = htmlToFragment(template);
    let projets = fragment.querySelector('[data-action="projets"]');
    projets.addEventListener("click", () => actions.surProjets(projets));
    fragment.querySelector('[data-action="fermer"]').addEventListener("click", actions.surFermer);
    return fragment;
  },
};

export { GuideView };
