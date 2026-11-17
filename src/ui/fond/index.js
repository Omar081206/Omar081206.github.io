import { htmlToFragment, remplirSlot } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

// Fond d'écran : scène animée en calques (par défaut) ou image choisie par
// le visiteur, et l'accueil (titre OMAR) par-dessus.
let FondView = {
  /**
   * @param {{image: string, titreMasque: boolean}} data - image : data URL ou "".
   * @param {Node} accueil
   * @param {{surFichier: (fichier: File) => void}} actions
   * @returns {DocumentFragment}
   */
  dom: function (data, accueil, actions) {
    let fragment = htmlToFragment(template);
    let racine = fragment.firstElementChild;
    FondView.appliquer(racine, data);
    remplirSlot(fragment, "accueil", accueil);
    let champ = fragment.querySelector("input[type=file]");
    champ.addEventListener("change", function () {
      if (champ.files[0]) {
        actions.surFichier(champ.files[0]);
      }
      champ.value = "";
    });
    return fragment;
  },

  /**
   * Met le fond à jour sans le reconstruire (les animations continuent).
   *
   * @param {HTMLElement} racine - L'élément .fond.
   * @param {{image: string, titreMasque: boolean}} data
   */
  appliquer: function (racine, data) {
    let image = racine.querySelector(".fond__image");
    image.style.backgroundImage = data.image ? `url("${data.image.replace(/"/g, "%22")}")` : "";
    image.hidden = !data.image;
    racine.classList.toggle("fond--image", !!data.image);
    racine.classList.toggle("fond--sans-titre", data.titreMasque);
  },

  /**
   * Ouvre le sélecteur de fichier du système.
   *
   * @param {HTMLElement} racine
   */
  choisirFichier: function (racine) {
    racine.querySelector("input[type=file]").click();
  },
};

export { FondView };
