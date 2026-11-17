import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

// Barre du haut : marque, nom de l'appli active, interrupteurs, heure.
let BarreMenuView = {
  html: function (data) {
    return genericRenderer(template, { appli: data.appli, heure: data.heure });
  },

  /**
   * @param {{appli: string, heure: string,
   *          reglages: {son: boolean, musique: boolean, glitch: boolean, animation: boolean}}} data
   * @param {{surMarque: (bouton: HTMLElement) => void,
   *          surReglage: (nom: string) => void}} actions
   * @returns {DocumentFragment}
   */
  dom: function (data, actions) {
    let fragment = htmlToFragment(BarreMenuView.html(data));
    let marque = fragment.querySelector('[data-action="marque"]');
    marque.addEventListener("click", () => actions.surMarque(marque));
    for (let bouton of fragment.querySelectorAll("[data-reglage]")) {
      let nom = bouton.getAttribute("data-reglage");
      // Un template n'a pas de condition : l'état des interrupteurs se règle ici.
      bouton.setAttribute("aria-pressed", data.reglages[nom] ? "true" : "false");
      bouton.setAttribute("data-focus", "reglage-" + nom);
      bouton.addEventListener("click", () => actions.surReglage(nom));
    }
    return fragment;
  },
};

export { BarreMenuView };
