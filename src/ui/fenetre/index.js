import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { codeFenetre } from "../../lib/format.js";
import template from "./template.html?raw";
import "./style.css";

// Cadre commun à toutes les fenêtres : barre de titre (fermer, réduire,
// agrandir), identifiant décoratif et zone de contenu.
// Les commandes et le déplacement sont branchés par lib/fenetres.js.
let FenetreView = {
  html: function (data) {
    return genericRenderer(template, { id: data.id, titre: data.titre, code: codeFenetre(data.id) });
  },

  /**
   * @param {{id: string, titre: string, modificateur?: string, modificateurContenu?: string}} data
   *   modificateur : classe BEM ajoutée à la racine (ex. "fenetre--fiche") ;
   *   modificateurContenu : classe ajoutée à la zone de contenu.
   * @param {Node} contenu - Ce que la fenêtre affiche.
   * @returns {HTMLElement} - La racine .fenetre.
   */
  dom: function (data, contenu) {
    let fragment = htmlToFragment(FenetreView.html(data));
    let racine = fragment.firstElementChild;
    if (data.modificateur) {
      racine.classList.add(data.modificateur);
    }
    if (data.modificateurContenu) {
      racine.querySelector(".fenetre__contenu").classList.add(data.modificateurContenu);
    }
    remplirSlot(fragment, "contenu", contenu);
    return racine;
  },
};

export { FenetreView };
