import { creerSynthese } from "./son-synthese.js";

/**
 * Moteur audio : bruitages et musique d'ambiance.
 *
 * - Bruitages : fichiers MP3 de sons/, décodés au premier geste du visiteur
 *   (un navigateur interdit le son avant). Tant qu'ils ne sont pas prêts,
 *   une version synthétisée les remplace.
 * - Musique : sons/musique-menu.mp3, lue en flux. Si le fichier manque, un
 *   souffle d'ambiance en boucle (sons/ambiance.mp3) prend le relais.
 *
 * Ce module ne lit ni n'écrit les réglages : main.js lui dit si le son et la
 * musique sont actifs (voir data/reglages.js).
 */

const BRUITAGES = ["open", "close", "error", "boot", "ambiance"];
const VOLUMES = { open: 0.6, close: 0.55, error: 0.5, boot: 0.65, ambiance: 0.12 };
const MUSIQUE = "sons/musique-menu.mp3";
const VOLUME_MUSIQUE = 0.18;

let ctx = null;
let sortie = null;
let synthese = null;
let actif = true;
let musiqueActive = true;
let derniers = {};
let tampons = {};
let chargement = null;

let ambiance = null; // couche de fond en cours : { arreter, attenuer }
let musique = null; // élément <audio>
let gainMusique = null;
let musiqueEnEchec = false;
let minuterieMusique = null;

/**
 * Crée le contexte audio au premier besoin et le relance s'il est suspendu.
 *
 * @returns {AudioContext|null}
 */
function preparer() {
  if (!ctx) {
    let Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) {
      return null;
    }
    ctx = new Contexte();
    sortie = ctx.createGain();
    sortie.gain.value = 0.32;
    let compresseur = ctx.createDynamicsCompressor();
    sortie.connect(compresseur);
    compresseur.connect(ctx.destination);
    synthese = creerSynthese(ctx, sortie);
    chargerBruitages();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

/**
 * Télécharge et décode tous les bruitages (une seule fois).
 *
 * @returns {Promise<void>}
 */
function chargerBruitages() {
  if (chargement) {
    return chargement;
  }
  chargement = Promise.all(
    BRUITAGES.map(async function (nom) {
      try {
        let reponse = await fetch(`sons/${nom}.mp3`);
        if (!reponse.ok) {
          return;
        }
        tampons[nom] = await ctx.decodeAudioData(await reponse.arrayBuffer());
      } catch (erreur) {
        // Fichier absent ou illisible : la synthèse reste en place.
      }
    })
  ).then(() => undefined);
  return chargement;
}

/**
 * Joue un bruitage décodé.
 *
 * @param {string} nom
 */
function jouerTampon(nom) {
  let source = ctx.createBufferSource();
  let gain = ctx.createGain();
  source.buffer = tampons[nom];
  gain.gain.value = VOLUMES[nom] || 0.4;
  source.connect(gain);
  gain.connect(sortie);
  source.start();
}

/**
 * Fait varier le volume de la musique jusqu'à cible en duree ms.
 *
 * @param {number} cible
 * @param {number} duree
 * @param {() => void} [ensuite]
 */
function volumeMusique(cible, duree, ensuite) {
  if (minuterieMusique) {
    clearInterval(minuterieMusique);
    clearTimeout(minuterieMusique);
    minuterieMusique = null;
  }
  if (gainMusique) {
    let maintenant = ctx.currentTime;
    let g = gainMusique.gain;
    g.cancelScheduledValues(maintenant);
    g.setValueAtTime(g.value, maintenant);
    g.linearRampToValueAtTime(cible, maintenant + duree / 1000);
    if (ensuite) {
      minuterieMusique = setTimeout(function () {
        minuterieMusique = null;
        ensuite();
      }, duree + 50);
    }
    return;
  }
  // Sans Web Audio (page ouverte en file://) : volume de l'élément, pas à pas
  let depart = musique.volume;
  let t0 = Date.now();
  minuterieMusique = setInterval(function () {
    let k = Math.min(1, (Date.now() - t0) / duree);
    musique.volume = Math.max(0, Math.min(1, depart + (cible - depart) * k));
    if (k >= 1) {
      clearInterval(minuterieMusique);
      minuterieMusique = null;
      if (ensuite) {
        ensuite();
      }
    }
  }, 40);
}

/**
 * Couche « musique du menu » : élément <audio> branché sur Web Audio en
 * http(s) (volume fiable sur iOS).
 *
 * @returns {{arreter: () => void, attenuer: (cachee: boolean) => void}}
 */
function coucheMusique() {
  if (!musique) {
    musique = new Audio();
    musique.loop = true;
    musique.preload = "auto";
    musique.addEventListener("error", function () {
      if (musiqueEnEchec) {
        return;
      }
      musiqueEnEchec = true;
      if (ambiance && ambiance.estMusique) {
        ambiance = null;
        demarrerAmbiance();
      }
    });
    musique.src = MUSIQUE;
    if (/^https?:$/.test(location.protocol)) {
      try {
        let noeud = ctx.createMediaElementSource(musique);
        gainMusique = ctx.createGain();
        gainMusique.gain.value = 0;
        noeud.connect(gainMusique);
        gainMusique.connect(ctx.destination);
      } catch (erreur) {
        gainMusique = null;
      }
    }
  }
  musique.volume = gainMusique ? 1 : 0;

  let couche = {
    estMusique: true,
    arreter: function () {
      volumeMusique(0, 600, () => musique.pause());
    },
    attenuer: function (cachee) {
      if (cachee) {
        volumeMusique(0, 800, () => musique.pause());
        return;
      }
      musique.play().catch(() => {
        // Reprise au prochain geste du visiteur.
      });
      volumeMusique(VOLUME_MUSIQUE, 800);
    },
  };

  musique.play().catch(function (erreur) {
    if (ambiance === couche) {
      ambiance = null;
    }
    if (erreur && erreur.name !== "NotAllowedError" && erreur.name !== "AbortError") {
      musiqueEnEchec = true;
      demarrerAmbiance();
    }
  });
  volumeMusique(VOLUME_MUSIQUE, 3000);
  return couche;
}

/**
 * Couche de secours : souffle de ville extrait du jeu, en boucle et filtré.
 *
 * @returns {{arreter: () => void, attenuer: (cachee: boolean) => void}}
 */
function coucheSouffle() {
  let t = ctx.currentTime;
  let bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, t);
  bus.gain.exponentialRampToValueAtTime(0.5, t + 3);
  bus.connect(sortie);
  let source = ctx.createBufferSource();
  source.buffer = tampons.ambiance;
  source.loop = true;
  let filtre = ctx.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 3000;
  filtre.Q.value = 0.5;
  let gain = ctx.createGain();
  gain.gain.value = VOLUMES.ambiance;
  source.connect(filtre);
  filtre.connect(gain);
  gain.connect(bus);
  source.start();

  function rampe(cible, duree) {
    let n = ctx.currentTime;
    bus.gain.cancelScheduledValues(n);
    bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), n);
    bus.gain.exponentialRampToValueAtTime(cible, n + duree);
  }

  return {
    arreter: function () {
      rampe(0.0001, 0.6);
      setTimeout(function () {
        source.stop();
        bus.disconnect();
      }, 700);
    },
    attenuer: function (cachee) {
      rampe(cachee ? 0.0001 : 0.5, 0.8);
    },
  };
}

/**
 * Lance la musique (ou le souffle de secours) si tout est réuni.
 */
function demarrerAmbiance() {
  if (ambiance || !ctx || ctx.state !== "running" || !actif || !musiqueActive) {
    return;
  }
  if (!musiqueEnEchec) {
    ambiance = coucheMusique();
    return;
  }
  if (!tampons.ambiance) {
    chargerBruitages().then(function () {
      if (tampons.ambiance) {
        demarrerAmbiance();
      }
    });
    return;
  }
  ambiance = coucheSouffle();
}

function arreterAmbiance() {
  if (ambiance) {
    ambiance.arreter();
    ambiance = null;
  }
}

/**
 * Premier geste du visiteur : le navigateur autorise enfin le son.
 */
function deverrouiller() {
  if (!actif) {
    return;
  }
  let c = preparer();
  if (!c) {
    return;
  }
  if (c.state === "running") {
    demarrerAmbiance();
  } else {
    c.resume().then(demarrerAmbiance);
  }
}

document.addEventListener("pointerdown", deverrouiller, true);
document.addEventListener("keydown", deverrouiller, true);
document.addEventListener("visibilitychange", function () {
  if (ambiance) {
    ambiance.attenuer(document.hidden);
  }
});

let Son = {};

/**
 * État de départ, lu dans les réglages enregistrés. Ne crée pas le contexte
 * audio : le navigateur l'interdit avant le premier geste du visiteur.
 *
 * @param {{son: boolean, musique: boolean}} reglages
 */
Son.configurer = function (reglages) {
  actif = reglages.son;
  musiqueActive = reglages.musique;
};

/**
 * Joue un bruitage : "open", "close", "error" ou "boot".
 *
 * @param {string} nom
 */
Son.jouer = function (nom) {
  if (!actif) {
    return;
  }
  let maintenant = Date.now();
  if (derniers[nom] && maintenant - derniers[nom] < 25) {
    return;
  }
  derniers[nom] = maintenant;
  if (!preparer() || ctx.state !== "running") {
    return;
  }
  if (tampons[nom]) {
    jouerTampon(nom);
  } else if (synthese[nom]) {
    synthese[nom]();
  }
};

/**
 * Active ou coupe tous les sons (bruitages et musique). Appelé par un clic
 * du visiteur : le contexte audio peut donc être créé.
 *
 * @param {boolean} valeur
 */
Son.activer = function (valeur) {
  actif = valeur;
  if (valeur) {
    deverrouiller();
  } else {
    arreterAmbiance();
  }
};

/**
 * Active ou coupe la musique d'ambiance seule.
 *
 * @param {boolean} valeur
 */
Son.activerMusique = function (valeur) {
  musiqueActive = valeur;
  if (valeur) {
    deverrouiller();
  } else {
    arreterAmbiance();
  }
};

export { Son };
