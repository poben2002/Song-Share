"use strict";
(function() {
  window.addEventListener("load", init);

  function init() {
    let contactButton = id('hire');
    contactButton.addEventListener('click', spotify);
    let Rbutton = id('resume');
    Rbutton.addEventListener('click', resume);
    let Gbutton = id('github');
    Gbutton.addEventListener('click', git);
    let Lbutton = id('linked');
    Lbutton.addEventListener('click', linked);
  }

  function id(idName) {
    return document.getElementById(idName);
  }

  function spotify() {
    window.open('https://open.spotify.com/user/xza74lgagwwrcus5fok7rp2fg?si=acde671cbb3d41a4');
  }

  function scroll() {
    window.scroll({
      top: document.body.scrollHeight,
      behavior: 'smooth'
  });
  }
})();