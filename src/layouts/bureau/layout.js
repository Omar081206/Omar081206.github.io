import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

/**
 * Layout du bureau : fond d'écran, barre de menu, zone des fenêtres, barre
 * des tâches, décor et écran de démarrage.
 *
 * Chaque <slot name="…"> est remplacé par l'application du bureau
 * (applications/bureau/application.js).
 *
 * @returns {DocumentFragment}
 */
export function BureauLayout() {
  return htmlToFragment(template);
}
