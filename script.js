// FixLens – basic interactions

document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menu-toggle");

  const menuOverlay = document.getElementById("menu-overlay");

  const menuClose = document.getElementById("menu-close");

  const menuBackdrop = document.querySelector(".menu-backdrop");



  function openMenu() {

    if (menuOverlay) {

      menuOverlay.classList.add("is-open");

    }

  }



  function closeMenu() {

    if (menuOverlay) {

      menuOverlay.classList.remove("is-open");

    }

  }



  if (menuToggle) {

    menuToggle.addEventListener("click", openMenu);

  }

  if (menuClose) {

    menuClose.addEventListener("click", closeMenu);

  }

  if (menuBackdrop) {

    menuBackdrop.addEventListener("click", closeMenu);

  }

});
