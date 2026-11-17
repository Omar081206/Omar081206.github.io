import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import titreLisse from "../../assets/titre/omar-lisse.webp";
import titreGlitch from "../../assets/titre/omar-glitch.webp";
import template from "./template.html?raw";
import "./style.css";

// Accueil sur le fond d'écran : titre OMAR, accroche et accès rapides.
let AccueilView = {
  html: function (data) {
    return genericRenderer(template, { accroche: data.accroche, lisse: titreLisse, glitch: titreGlitch });
  },

  /**
   * @param {{accroche: string}} data
   * @param {{surOuvrir: (id: string, bouton: HTMLElement) => void}} actions
   * @returns {DocumentFragment}
   */
  dom: function (data, actions) {
    let fragment = htmlToFragment(AccueilView.html(data));
    for (let bouton of fragment.querySelectorAll("[data-ouvrir]")) {
      bouton.addEventListener("click", () => actions.surOuvrir(bouton.getAttribute("data-ouvrir"), bouton));
    }
    return fragment;
  },

  /**
   * Un glitch du titre (environ une demi-seconde) : trois tranches tirées au
   * hasard se décalent pendant que les canaux rouge et cyan se séparent.
   *
   * @param {SVGElement} titre - L'élément .titre-omar.
   */
  glitcher: function (titre) {
    for (let fente of titre.querySelectorAll(".titre-omar__fente")) {
      fente.setAttribute("y", String(Math.round(-40 + Math.random() * 300)));
    }
    titre.classList.remove("titre-omar--glitch");
    void titre.getBoundingClientRect(); // relance l'animation
    titre.classList.add("titre-omar--glitch");
    setTimeout(() => titre.classList.remove("titre-omar--glitch"), 560);
  },
};

export { AccueilView };
