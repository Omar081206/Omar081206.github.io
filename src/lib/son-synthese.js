/**
 * Sons de secours synthétisés avec Web Audio, dans l'esprit des interfaces du
 * jeu. Ils ne servent que le temps que les vrais fichiers MP3 soient décodés.
 */

/**
 * Crée la banque de sons synthétisés.
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} sortie - Nœud vers lequel tout est envoyé.
 * @returns {Object<string, () => void>}
 */
export function creerSynthese(ctx, sortie) {
  function ton(o) {
    let t = ctx.currentTime + (o.delai || 0);
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = o.type || "square";
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) {
      osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.d);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(o.v || 0.2, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    let noeud = osc;
    if (o.passeBas) {
      let filtre = ctx.createBiquadFilter();
      filtre.type = "lowpass";
      filtre.frequency.value = o.passeBas;
      osc.connect(filtre);
      noeud = filtre;
    }
    noeud.connect(gain);
    gain.connect(sortie);
    osc.start(t);
    osc.stop(t + o.d + 0.02);
  }

  function bruit(o) {
    let t = ctx.currentTime + (o.delai || 0);
    let longueur = Math.max(1, Math.floor(ctx.sampleRate * o.d));
    let tampon = ctx.createBuffer(1, longueur, ctx.sampleRate);
    let donnees = tampon.getChannelData(0);
    for (let i = 0; i < longueur; i++) {
      donnees[i] = Math.random() * 2 - 1;
    }
    let source = ctx.createBufferSource();
    source.buffer = tampon;
    let filtre = ctx.createBiquadFilter();
    filtre.type = o.filtre || "bandpass";
    filtre.frequency.setValueAtTime(o.f0 || 2000, t);
    if (o.f1) {
      filtre.frequency.exponentialRampToValueAtTime(o.f1, t + o.d);
    }
    filtre.Q.value = o.q || 1;
    let gain = ctx.createGain();
    gain.gain.setValueAtTime(o.v || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    source.connect(filtre);
    filtre.connect(gain);
    gain.connect(sortie);
    source.start(t);
    source.stop(t + o.d + 0.02);
  }

  // Tintement métallique (synthèse FM)
  function metal(o) {
    let t = ctx.currentTime + (o.delai || 0);
    let porteuse = ctx.createOscillator();
    let modulante = ctx.createOscillator();
    let profondeur = ctx.createGain();
    let gain = ctx.createGain();
    let ratio = o.ratio || 1.41;
    porteuse.frequency.setValueAtTime(o.f, t);
    modulante.frequency.setValueAtTime(o.f * ratio, t);
    if (o.f1) {
      porteuse.frequency.exponentialRampToValueAtTime(o.f1, t + o.d);
      modulante.frequency.exponentialRampToValueAtTime(o.f1 * ratio, t + o.d);
    }
    profondeur.gain.setValueAtTime(o.f * (o.indice || 3), t);
    profondeur.gain.exponentialRampToValueAtTime(1, t + o.d);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(o.v || 0.15, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    modulante.connect(profondeur);
    profondeur.connect(porteuse.frequency);
    porteuse.connect(gain);
    gain.connect(sortie);
    porteuse.start(t);
    modulante.start(t);
    porteuse.stop(t + o.d + 0.02);
    modulante.stop(t + o.d + 0.02);
  }

  // Bip numérique dégradé (onde carrée écrasée sur 8 niveaux)
  let courbe = null;
  function degrade(o) {
    if (!courbe) {
      courbe = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        courbe[i] = Math.round((i / 127.5 - 1) * 4) / 4;
      }
    }
    let t = ctx.currentTime + (o.delai || 0);
    let osc = ctx.createOscillator();
    let forme = ctx.createWaveShaper();
    let gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(o.f, t);
    forme.curve = courbe;
    gain.gain.setValueAtTime(o.v || 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    osc.connect(forme);
    forme.connect(gain);
    gain.connect(sortie);
    osc.start(t);
    osc.stop(t + o.d + 0.02);
  }

  return {
    // « Jack-in » : coup sourd, tintement métallique, rafale de données
    open: function () {
      ton({ f0: 95, f1: 42, d: 0.22, v: 0.32, type: "sine" });
      bruit({ d: 0.05, f0: 180, filtre: "lowpass", v: 0.18 });
      metal({ f: 620, f1: 560, ratio: 2.76, indice: 5, d: 0.45, v: 0.09, delai: 0.02 });
      for (let i = 0; i < 7; i++) {
        degrade({ f: 900 + ((i * 397) % 1300), d: 0.03, v: 0.045, delai: 0.06 + i * 0.022 });
      }
      bruit({ d: 0.12, f0: 7000, f1: 2500, q: 3, v: 0.035, delai: 0.05 });
    },
    close: function () {
      metal({ f: 520, f1: 260, ratio: 2.76, indice: 4, d: 0.22, v: 0.07 });
      for (let i = 0; i < 4; i++) {
        degrade({ f: 1500 - i * 260, d: 0.025, v: 0.04, delai: i * 0.025 });
      }
      ton({ f0: 80, f1: 45, d: 0.12, v: 0.18, type: "sine", delai: 0.08 });
    },
    error: function () {
      ton({ f0: 140, d: 0.22, v: 0.12, type: "sawtooth", passeBas: 900 });
      ton({ f0: 147, d: 0.22, v: 0.1, type: "square", passeBas: 700 });
    },
    boot: function () {
      bruit({ d: 0.5, f0: 200, f1: 6000, q: 1, v: 0.12 });
      ton({ f0: 110, f1: 220, d: 0.5, v: 0.12, type: "sawtooth", passeBas: 1200 });
      ton({ f0: 880, d: 0.1, v: 0.08, delai: 0.45 });
      ton({ f0: 1320, d: 0.18, v: 0.08, delai: 0.55 });
    },
  };
}
