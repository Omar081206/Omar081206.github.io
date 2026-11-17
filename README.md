# Netrunner OS — portfolio d'Omar Hadj Zekri

**En ligne : <https://omar081206.github.io/>** — publié automatiquement par GitHub Actions (`.github/workflows/deploy.yml`) à chaque push sur `main`.

Bureau interactif façon Cyberpunk 2077 : fenêtres, terminal, version téléphone.
HTML, CSS et JavaScript vanilla (modules ES), CSS en BEM, architecture MVC calquée
sur le starter de la SAé 3.01, construit avec Vite.

## Lancer le projet

```bash
npm install        # une seule fois
npm run dev        # http://localhost:5173 (rechargement automatique)
npm run build      # produit dist/, le dossier à mettre en ligne
npm run preview    # teste dist/ sur http://localhost:4173
```

Le site ne s'ouvre pas en double-cliquant sur `index.html` (les modules ES et
le chargement des sons demandent un serveur). `dist/` utilise des chemins
relatifs : il fonctionne à la racine d'un domaine, dans un sous-dossier
(GitHub Pages, serveur de l'IUT) ou avec Live Server.

Fichiers à part dans `public/` : `cv-omar-hadj-zekri.pdf` (version publique,
sans téléphone ni adresse), `og-image.jpg` (aperçu réseaux sociaux, 1200×630),
`sons/musique-menu.mp3` (sans elle, un souffle d'ambiance la remplace).

## Organisation

```
index.html                 page unique : métadonnées, sprite d'icônes SVG, #app
public/                    copié tel quel : favicon, img/projets/<clé>/, sons/
src/
  main.js                  point d'entrée : monte le bureau, crée les fenêtres, raccourcis globaux
  styles/                  variables (charte), base, animations, blocs communs
  assets/                  images traitées par Vite : fond/, titre/, curseurs/
  data/                    MODÈLE : contenus et stockage
    profil.js              identité, coordonnées, CV, crédits
    projets.js             projets et dossiers de l'explorateur
    competences.js         compétences de l'écran d'attributs
    fichiers.js            système de fichiers du terminal (construit depuis les autres)
    reglages.js            réglages du visiteur (localStorage / sessionStorage)
  applications/<nom>/      une application = une fenêtre (ou un écran) en M / C / V
    application.js         M (état) → C (actions) → V (affichage), comme pages/ du starter
    template.html          gabarit HTML, placeholders {{clé}} échappés, <slot> pour les sous-parties
    style.css              blocs BEM de l'application
  ui/<nom>/                VUES réutilisables : index.js (XxxView.dom), template.html, style.css
  layouts/bureau/          structure de l'écran (slots remplis par applications/bureau)
  lib/                     mécanismes techniques
    fenetres.js            gestionnaire de fenêtres (ouvrir, fermer, réduire, déplacer, focus, retour mobile)
    son.js                 bruitages et musique (Web Audio) ; son-synthese.js : sons de secours
    utils.js               genericRenderer, htmlToFragment, remplirSlot
    focus.js, medias.js, texte.js, format.js, suggestion.js, navigateur.js
```

### Conventions

- **MVC** (règle du starter) : `M` ne contient que des données ; `C` est seul à lire
  `data/` et à modifier `M` (méthodes `handler_…`) ; `V` construit le DOM à partir
  de `M` et branche les événements sur les `handler_` de `C`. Une vue ne décide de
  rien et ne lit jamais `data/`.
- **Templates** : pas de boucle ni de condition dans un template. Une liste = un
  template par élément (`fait.html`, `fichier.html`…) qui remplace un `<slot>` ;
  un état (bouton pressé, élément masqué) se règle en JS après `htmlToFragment`.
  Tout texte passe par `{{…}}` (échappé) : aucun `innerHTML` avec du contenu variable.
- **BEM** : `bloc__element--modificateur`, noms en français, un bloc par fichier
  `style.css` du composant qui l'utilise ; les petits blocs partagés (`action`,
  `badge`, `etiquettes`, `surtitre`…) sont dans `styles/blocs-communs.css`.
  Les états accessibles se lisent dans les attributs ARIA (`aria-pressed`,
  `aria-current`) plutôt que dans des classes.
- **Nommage** : domaine en français (`ProjetsData`, `handler_selectionner`),
  mécanismes en anglais comme le starter (`genericRenderer`, `htmlToFragment`).
- **Focus** : les éléments qu'une vue reconstruit portent `data-focus` ; le focus
  clavier est rendu à leur équivalent après `V.rafraichir()`.

## Modifier un contenu

| Pour… | Fichier |
|---|---|
| texte du profil, mail, liens, CV | `src/data/profil.js` |
| ajouter un projet | `src/data/projets.js` (+ captures dans `public/img/projets/<clé>/`, + la clé dans un dossier `CATEGORIES`) |
| compétences | `src/data/competences.js` |
| couleurs, polices | `src/styles/variables.css` |

Un projet ajouté apparaît aussi dans l'explorateur, les compétences liées et le
terminal (`projets/<dossier>/<clé>.md`) sans autre modification.

## Vérifier

- HTML : DOM rendu (`document.documentElement.outerHTML`) sur
  <https://validator.w3.org/nu/>, à 1440 et 390 px.
- CSS : `npm run build`, puis `dist/assets/*.css` sur
  <https://jigsaw.w3.org/css-validator/>.

Œuvre de fan non officielle, non approuvée par CD PROJEKT RED. Bruitages et
musique : Cyberpunk 2077 © CD PROJEKT RED.
