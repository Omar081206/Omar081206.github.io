import "./style.css";

const DUREE = 1800;

let minuterie = null;

// Message bref en bas de l'écran (« Adresse copiée », « Bruitages activés »…).
// Un seul élément, créé une fois et lu par les lecteurs d'écran (role=status).
let ToastView = {
  /**
   * @returns {HTMLElement}
   */
  dom: function () {
    let p = document.createElement("p");
    p.className = "toast";
    p.setAttribute("role", "status");
    p.hidden = true;
    return p;
  },

  /**
   * Affiche un message pendant 1,8 s.
   *
   * @param {HTMLElement} element - L'élément créé par dom().
   * @param {string} message
   */
  afficher: function (element, message) {
    element.textContent = message;
    element.hidden = false;
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      element.hidden = true;
    }, DUREE);
  },
};

export { ToastView };
