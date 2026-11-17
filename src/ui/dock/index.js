import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateBouton from "./bouton.html?raw";
import templateDemarrer from "./demarrer.html?raw";
import "./style.css";

// Barre des tâches. Sur ordinateur, elle est toujours visible comme celle d'un
// vrai système : bouton NOS (aide), applications épinglées, puis fiches projet
// ouvertes. Sur téléphone, seules les fenêtres ouvertes ou réduites y figurent.
let DockView = {
  /**
   * @param {Array<{id: string, titre: string, icone: string, fiche: boolean,
   *                presente: boolean, ouverte: boolean}>} fenetres
   * @param {{surClic: (id: string, bouton: HTMLElement) => void,
   *          surDemarrer: (bouton: HTMLElement) => void}} actions
   * @param {Array<{id: string, libelle: string, icone: string}>} epingles
   * @param {boolean} aideOuverte
   * @returns {DocumentFragment}
   */
  dom: function (fenetres, actions, epingles, aideOuverte) {
    let fragment = htmlToFragment(template);
    let etat = function (id) {
      return fenetres.find((f) => f.id === id) || { presente: false, ouverte: false };
    };

    let creer = function (donnees, f, sorte) {
      let item = htmlToFragment(genericRenderer(templateBouton, donnees)).firstElementChild;
      item.classList.add("dock__item--" + sorte);
      item.classList.toggle("dock__item--presente", f.presente);
      // Trait sous l'icône : la fenêtre est ouverte (et non réduite)
      item.classList.toggle("dock__item--ouverte", f.ouverte);
      let bouton = item.querySelector(".dock__bouton");
      bouton.addEventListener("click", () => actions.surClic(donnees.id, bouton));
      return item;
    };

    let demarrer = htmlToFragment(templateDemarrer).firstElementChild;
    let boutonDemarrer = demarrer.querySelector("button");
    boutonDemarrer.setAttribute("aria-expanded", aideOuverte ? "true" : "false");
    boutonDemarrer.addEventListener("click", () => actions.surDemarrer(boutonDemarrer));

    let elements = [demarrer];
    epingles.forEach(function (app) {
      elements.push(creer({ id: app.id, icone: app.icone, libelle: app.libelle, court: app.libelle }, etat(app.id), "appli"));
    });
    let fiches = fenetres.filter((f) => f.fiche && f.presente);
    if (fiches.length) {
      let separateur = document.createElement("li");
      separateur.className = "dock__separateur";
      separateur.setAttribute("aria-hidden", "true");
      elements.push(separateur);
    }
    fiches.forEach(function (f) {
      elements.push(creer({ id: f.id, icone: f.icone, libelle: "Fiche : " + f.titre, court: f.titre }, f, "fiche"));
    });
    remplirSlot(fragment, "boutons", elements);
    return fragment;
  },
};

export { DockView };
