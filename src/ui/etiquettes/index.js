import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateItem from "./item.html?raw";

// Liste d'étiquettes (technologies, outils). Styles : styles/blocs-communs.css.
let EtiquettesView = {
  /**
   * @param {string[]} textes
   * @param {{titreId?: string}} [options] - titreId : id du titre qui nomme la liste.
   * @returns {DocumentFragment}
   */
  dom: function (textes, options) {
    let fragment = htmlToFragment(template);
    if (options && options.titreId) {
      fragment.firstElementChild.setAttribute("aria-labelledby", options.titreId);
    }
    let items = textes.map((texte) => htmlToFragment(genericRenderer(templateItem, { texte })));
    remplirSlot(fragment, "items", items);
    return fragment;
  },
};

export { EtiquettesView };
