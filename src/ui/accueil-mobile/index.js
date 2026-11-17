import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

// Écran d'accueil du téléphone : grande horloge, date et accroche.
let AccueilMobileView = {
  html: function (data) {
    return genericRenderer(template, data);
  },

  /**
   * @param {{heure: string, date: string, accroche: string}} data
   * @returns {DocumentFragment}
   */
  dom: function (data) {
    return htmlToFragment(AccueilMobileView.html(data));
  },
};

export { AccueilMobileView };
