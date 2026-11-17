import { defineConfig } from "vite";

export default defineConfig({
  // Chemins relatifs : le dossier dist/ fonctionne tel quel à la racine d'un
  // domaine, dans un sous-dossier (GitHub Pages, serveur de l'IUT) ou avec
  // « npm run preview ».
  base: "./",

  build: {
    target: "es2020",
    // Les petites images (curseurs) restent intégrées au CSS ; les fonds
    // d'écran et le titre deviennent des fichiers à part.
    assetsInlineLimit: 4096,
  },
});
