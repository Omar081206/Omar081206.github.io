import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateItem from "./item.html?raw";
import "./style.css";

// Icônes du bureau (colonne à gauche sur ordinateur, grille sur téléphone).
let RaccourcisView = {
  /**
   * @param {Array<{id: string, libelle: string, icone: string}>} items
   * @param {{surOuvrir: (id: string, bouton: HTMLElement) => void}} actions
   * @returns {DocumentFragment}
   */
  dom: function (items, actions) {
    let fragment = htmlToFragment(template);
    let elements = items.map(function (item) {
      let li = htmlToFragment(genericRenderer(templateItem, item)).firstElementChild;
      let bouton = li.querySelector("button");
      bouton.addEventListener("click", () => actions.surOuvrir(item.id, bouton));
      return li;
    });
    remplirSlot(fragment, "items", elements);
    return fragment;
  },
};

export { RaccourcisView };
