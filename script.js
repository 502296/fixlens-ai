// script.js – FixLens frontend logic



const API_TEXT = "/api/text-diagnosis";

const API_PHOTO = "/api/photo-diagnosis";



document.addEventListener("DOMContentLoaded", () => {

  const btnText = document.getElementById("btn-text");

  const btnPhoto = document.getElementById("btn-photo");

  const btnSpeak = document.getElementById("btn-speak");

  const photoInput = document.getElementById("photo-input");

  const resultPanel = document.getElementById("result-panel");

  const resultContent = document.getElementById("result-content");



  const menuToggle = document.getElementById("menu-toggle");

  const menuOverlay = document.getElementById("menu-overlay");

  const menuClose = document.getElementById("menu-close");



  // ========= Result handling =========



  function showResult(text) {

    if (!resultPanel || !resultContent) return;

    resultPanel.style.display = "block";

    resultContent.textContent = text;

  }



  async function callApi(url, payload) {

    showResult("Thinking… analyzing your problem with FixLens AI.");

    try {

      const res = await fetch(url, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify(payload),

      });



      if (!res.ok) {

        const errorBody = await res.text();

        console.error("API error:", errorBody);

        showResult("Something went wrong. Please try again in a moment.");

        return;

      }



      const data = await res.json();

      if (data && data.answer) {

        showResult(data.answer);

      } else {

        showResult("No answer returned from FixLens AI.");

      }

    } catch (err) {

      console.error(err);

      showResult("Network error. Please check your connection and try again.");

    }

  }



  // ========= Buttons: Text / Photo / Voice =========



  if (btnText) {

    btnText.addEventListener("click", () => {

      const description = window.prompt(

        "Describe the problem in your own words:"

      );

      if (!description || !description.trim()) return;

      callApi(API_TEXT, { description: description.trim() });

    });

  }



  if (btnPhoto && photoInput) {

    btnPhoto.addEventListener("click", () => {

      photoInput.click();

    });



    photoInput.addEventListener("change", () => {

      const file = photoInput.files && photoInput.files[0];

      if (!file) return;



      const reader = new FileReader();

      reader.onloadend = () => {

        const dataUrl = reader.result;

        if (!dataUrl) return;

        callApi(API_PHOTO, { image: dataUrl });

      };

      reader.readAsDataURL(file);

    });

  }



  if (btnSpeak) {

    btnSpeak.addEventListener("click", () => {

      alert("Voice mode is coming soon to FixLens 🔊");

    });

  }



  // ========= Menu overlay =========



  function openMenu() {

    if (!menuOverlay) return;

    menuOverlay.classList.add("is-open");

    menuOverlay.setAttribute("aria-hidden", "false");

  }



  function closeMenu() {

    if (!menuOverlay) return;

    menuOverlay.classList.remove("is-open");

    menuOverlay.setAttribute("aria-hidden", "true");

  }



  if (menuToggle) {

    menuToggle.addEventListener("click", openMenu);

  }



  if (menuClose) {

    menuClose.addEventListener("click", closeMenu);

  }



  if (menuOverlay) {

    menuOverlay.addEventListener("click", (e) => {

      if (e.target.classList.contains("menu-backdrop")) {

        closeMenu();

      }

    });

  }



  // Optional: ESC to close menu

  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

      closeMenu();

    }

  });

});
