/**
 * Compétences de l'écran d'attributs. Aucun chiffre ni niveau (décision d'Omar) :
 * chaque compétence liste ses savoir-faire, ses outils et les projets qui la prouvent.
 * L'ordre est celui des nœuds sur la carte.
 */

const COMPETENCES = {
  front: {
    nom: "Front-end",
    icone: "i-code",
    description: "Des pages accessibles, responsives et valides W3C.",
    savoirs: [
      "Intégration de maquettes en site web",
      "Sémantique HTML et validité W3C",
      "Flexbox et Grid",
      "Responsive mobile-first",
      "Accessibilité",
    ],
    outils: ["HTML", "CSS", "Tailwind CSS", "VS Code", "Git / GitHub"],
    projets: ["cc", "st", "nt", "pf"],
  },
  script: {
    nom: "Script",
    icone: "i-brace",
    description: "Des interfaces interactives en JavaScript.",
    savoirs: [
      "DOM et événements",
      "Modules ES et architecture MVC",
      "Fetch et API JSON",
      "Pages générées à partir de données",
      "Programmation algorithmique",
    ],
    outils: ["JavaScript", "Python", "Java", "Vite"],
    projets: ["cc", "st", "nt", "pf"],
  },
  design: {
    nom: "Design UI",
    icone: "i-pen",
    description: "Des maquettes Figma, du wireframe au prototype.",
    savoirs: [
      "Benchmark et moodboard",
      "Wireframes",
      "Maquettes et prototypes Figma",
      "Styles, composants et auto-layout",
      "Retouche photo et dessin numérique",
    ],
    outils: ["Figma", "Photoshop", "Illustrator"],
    projets: ["dr", "eh", "sp", "cc"],
  },
  ia: {
    nom: "IA",
    icone: "i-ai",
    description: "L'IA comme outil, avec relecture et tests.",
    savoirs: [
      "Agents de code (Claude Code)",
      "Consignes et skills de projet (AGENTS.md)",
      "MCP Figma : de la maquette au code",
      "Relecture et tests Playwright du code produit",
    ],
    outils: ["Claude Code", "MCP Figma", "Playwright"],
    projets: ["cc", "pf"],
  },
  back: {
    nom: "Back-end",
    icone: "i-db",
    description: "API PHP, bases MySQL et back-office.",
    savoirs: [
      "Gestion de bases de données",
      "API PHP en JSON",
      "Modélisation (MCD)",
      "Requêtes préparées (PDO)",
      "Back-office et authentification",
    ],
    outils: ["PHP", "MySQL", "Looping", "Apache"],
    projets: ["cc", "st"],
  },
  motion: {
    nom: "Motion",
    icone: "i-wave",
    description: "Animations d'interface et montage vidéo.",
    savoirs: ["Transitions et animations CSS", "Effets glitch et CRT", "Montage vidéo", "Motion design"],
    outils: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut"],
    projets: ["pf"],
  },
};

let CompetencesData = {};

/**
 * Une compétence par sa clé.
 *
 * @param {string} cle
 * @returns {Object|null}
 */
CompetencesData.lire = function (cle) {
  return Object.prototype.hasOwnProperty.call(COMPETENCES, cle) ? COMPETENCES[cle] : null;
};

/**
 * Toutes les clés, dans l'ordre de la carte.
 *
 * @returns {string[]}
 */
CompetencesData.cles = function () {
  return Object.keys(COMPETENCES);
};

export { CompetencesData };
