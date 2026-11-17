import { ProjetsData } from "../../data/projets.js";
import { genericRenderer, htmlToFragment, remplirSlot } from "../../lib/utils.js";
import { deuxChiffres } from "../../lib/format.js";
import { estMobile } from "../../lib/medias.js";
import { releverFocus, rendreFocus } from "../../lib/focus.js";
import { ouvrirOnglet } from "../../lib/navigateur.js";
import { FenetreView } from "../../ui/fenetre/index.js";
import { EtiquettesView } from "../../ui/etiquettes/index.js";
import template from "./template.html?raw";
import templateMeta from "./meta.html?raw";
import templateEtape from "./etape.html?raw";
import templateGalerie from "./galerie.html?raw";
import templateMiniature from "./miniature.html?raw";
import "./style.css";

/**
 * Fiche projet : une fenêtre par projet ouvert (plusieurs à la fois).
 *
 * Contrairement aux autres applications, il en existe plusieurs : chaque
 * appel à FicheProjetApplication crée son propre trio M / C / V.
 */

/**
 * @param {string} cle - Projet affiché.
 * @param {{afficherMessage: (texte: string) => void,
 *          agrandir: (captures: Array<{src: string, legende: string}>, index: number) => void}} actions
 * @returns {{element: HTMLElement, surTouche: (e: KeyboardEvent) => boolean}}
 */
export function FicheProjetApplication(cle, actions) {
  let M = {
    cle,
    projet: ProjetsData.lire(cle),
    index: 0, // capture affichée
  };

  let C = {};

  /**
   * @param {number} index - Peut sortir des bornes : on boucle.
   */
  C.handler_capture = function (index) {
    let n = M.projet.captures.length;
    M.index = (index + n) % n;
    V.rafraichirGalerie();
  };

  C.handler_agrandir = function () {
    actions.agrandir(M.projet.captures, M.index);
  };

  /**
   * @param {"maquette"|"code"} sorte
   */
  C.handler_suivreLien = function (sorte) {
    let url = M.projet.liens[sorte];
    if (!url) {
      return;
    }
    ouvrirOnglet(url);
    actions.afficherMessage("Ouverture : " + ProjetsData.libelleLien(M.cle, sorte).nom);
  };

  /**
   * F et G quand la fiche est la fenêtre active.
   *
   * @param {KeyboardEvent} e
   * @returns {boolean}
   */
  C.surTouche = function (e) {
    let touche = e.key.toLowerCase();
    if (touche !== "f" && touche !== "g") {
      return false;
    }
    let sorte = touche === "f" ? "maquette" : "code";
    if (M.projet.liens[sorte]) {
      V.frapper(sorte);
      C.handler_suivreLien(sorte);
    }
    return true;
  };

  let V = {};

  V.racine = null; // élément .fiche
  V.fenetre = null;

  V.init = function () {
    let p = M.projet;
    let fragment = htmlToFragment(
      genericRenderer(template, {
        type: p.type,
        annee: p.annee,
        nom: p.nom,
        badge: p.badge,
        description: p.description,
        libelleMaquette: ProjetsData.libelleLien(M.cle, "maquette").libelle,
        libelleCode: ProjetsData.libelleLien(M.cle, "code").libelle,
        objectif: p.objectif,
        resultat: p.resultat,
      })
    );
    V.racine = fragment.firstElementChild;
    remplirSlot(fragment, "meta", p.meta.map((m) => htmlToFragment(genericRenderer(templateMeta, m))));
    remplirSlot(fragment, "technos", EtiquettesView.dom(p.technos));
    V.racine.querySelector(".fiche__infos > .etiquettes").classList.add("fiche__technos");
    remplirSlot(
      fragment,
      "etapes",
      p.etapes.map((texte) => htmlToFragment(genericRenderer(templateEtape, { texte })))
    );
    for (let bouton of fragment.querySelectorAll("[data-lien]")) {
      let sorte = bouton.getAttribute("data-lien");
      bouton.hidden = !p.liens[sorte];
      bouton.addEventListener("click", () => C.handler_suivreLien(sorte));
    }
    V.racine.querySelector(".galerie").replaceWith(V.createGalerie());

    V.fenetre = FenetreView.dom({ id: "fiche-" + M.cle, titre: p.nom, modificateur: "fenetre--fiche" }, fragment);
    V.fenetre.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT") {
        return;
      }
      if (e.key === "ArrowRight") {
        C.handler_capture(M.index + 1);
      } else if (e.key === "ArrowLeft") {
        C.handler_capture(M.index - 1);
      }
    });
    // La galerie suit la taille de la fenêtre (agrandie, redimensionnée…)
    new ResizeObserver(() => V.ajusterGalerie()).observe(V.fenetre.querySelector(".fenetre__contenu"));
    return V.fenetre;
  };

  V.rafraichirGalerie = function () {
    let focus = releverFocus(V.racine);
    V.racine.querySelector(".galerie").replaceWith(V.createGalerie());
    rendreFocus(V.racine, focus);
    V.ajusterGalerie();
  };

  V.createGalerie = function () {
    let captures = M.projet.captures;
    let capture = captures[M.index];
    let fragment = htmlToFragment(
      genericRenderer(templateGalerie, {
        src: capture.src,
        legende: capture.legende,
        numero: deuxChiffres(M.index + 1),
        total: deuxChiffres(captures.length),
      })
    );
    let miniatures = captures.map(function (c, i) {
      let miniature = htmlToFragment(
        genericRenderer(templateMiniature, { index: i, numero: i + 1, legende: c.legende, src: c.src })
      ).firstElementChild;
      miniature.setAttribute("aria-pressed", i === M.index ? "true" : "false");
      miniature.addEventListener("click", () => C.handler_capture(i));
      return miniature;
    });
    remplirSlot(fragment, "miniatures", miniatures);
    fragment.querySelector(".galerie__agrandir").addEventListener("click", C.handler_agrandir);
    fragment.querySelector(".galerie__image").addEventListener("load", () => V.ajusterGalerie());
    fragment.querySelector('[data-action="precedente"]').addEventListener("click", () => C.handler_capture(M.index - 1));
    fragment.querySelector('[data-action="suivante"]').addEventListener("click", () => C.handler_capture(M.index + 1));
    return fragment;
  };

  /**
   * Ordinateur : hauteur de la capture calculée pour que la capture, sa
   * légende et les miniatures tiennent sans défiler (variable CSS --capture-h).
   */
  V.ajusterGalerie = function () {
    let contenu = V.fenetre.querySelector(".fenetre__contenu");
    let galerie = V.racine.querySelector(".galerie");
    let capture = galerie.querySelector(".galerie__capture");
    if (estMobile() || !contenu.clientHeight) {
      galerie.style.removeProperty("--capture-h");
      return;
    }
    let hautDans = function (el) {
      let t = 0;
      while (el && el !== V.fenetre) {
        t += el.offsetTop;
        el = el.offsetParent;
      }
      return t;
    };
    let marge = parseFloat(getComputedStyle(contenu).paddingBottom) || 0;
    let visionneur = galerie.querySelector(".galerie__visionneur");
    let hauteurLegende = visionneur.offsetHeight - capture.offsetHeight;
    let disponible = contenu.clientHeight - (hautDans(galerie) - hautDans(contenu)) - hauteurLegende - marge;
    let image = capture.querySelector("img");
    let ratio = image && image.naturalWidth ? image.naturalWidth / image.naturalHeight : 1.6;
    // Image en hauteur (écran de téléphone, page longue) : léger défilement accepté pour qu'elle reste lisible
    let place = Math.max(disponible, 320) * (ratio < 1 ? 1.35 : 1);
    let hauteurNaturelle = image && image.naturalHeight ? image.naturalHeight : place;
    let h = Math.min(capture.clientWidth / ratio, place, Math.max(hauteurNaturelle, 320));
    galerie.style.setProperty("--capture-h", Math.round(h) + "px");
  };

  /**
   * @param {"maquette"|"code"} sorte
   */
  V.frapper = function (sorte) {
    let bouton = V.racine.querySelector(`[data-lien="${sorte}"]`);
    bouton.classList.add("action--frappe");
    setTimeout(() => bouton.classList.remove("action--frappe"), 180);
  };

  return { element: V.init(), surTouche: C.surTouche, ajuster: () => V.ajusterGalerie() };
}
