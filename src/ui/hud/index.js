import { htmlToFragment } from "../../lib/utils.js";
import { mouvementReduit } from "../../lib/medias.js";
import template from "./template.html?raw";
import "./style.css";

const LIGNES = 40;

function ligneAuHasard() {
  let sortie = "";
  for (let i = 0; i < 4; i++) {
    sortie += Math.random() > 0.5 ? "1" : "0";
  }
  return sortie;
}

// Décor façon interface de jeu : colonne de données qui défile à droite,
// coordonnées en bas à gauche. Purement décoratif (caché aux lecteurs d'écran).
let HudView = {
  /**
   * @returns {DocumentFragment}
   */
  dom: function () {
    let fragment = htmlToFragment(template);
    let colonne = fragment.querySelector(".hud__colonne");
    let lignes = Array.from({ length: LIGNES }, ligneAuHasard);
    colonne.textContent = lignes.join("\n");
    if (!mouvementReduit()) {
      setInterval(function () {
        lignes.shift();
        lignes.push(ligneAuHasard());
        colonne.textContent = lignes.join("\n");
      }, 450);
    }
    return fragment;
  },
};

export { HudView };
