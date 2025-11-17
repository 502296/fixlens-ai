// script.js – Frontend logic for FixLens



const API_TEXT = "/api/text-diagnosis";

const API_PHOTO = "/api/photo-diagnosis";



document.addEventListener("DOMContentLoaded", () => {

  const btnText = document.getElementById("btn-text");

  const btnPhoto = document.getElementById("btn-photo");

  const btnSpeak = document.getElementById("btn-speak");

  const photoInput = document.getElementById("photo-input");

  const resultPanel = document.getElementById("result-panel");

  const resultContent = document.getElementById("result-content");



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



  // 1) Describe with text

  if (btnText) {

    btnText.addEventListener("click", () => {

      const description = window.prompt(

        "Describe the problem in your own words:"

      );

      if (!description || !description.trim()) return;

      callApi(API_TEXT, { description: description.trim() });

    });

  }



  // 2) Upload a photo

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



        // نرسل الـ Data URL مباشرة للـ API

        callApi(API_PHOTO, { image: dataUrl });

      };

      reader.readAsDataURL(file);

    });

  }



  // 3) Speak – نتركها "قريبًا"

  if (btnSpeak) {

    btnSpeak.addEventListener("click", () => {

      alert("Voice mode is coming soon to FixLens 🔊");

    });

  }

});
