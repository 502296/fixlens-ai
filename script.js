// script.js – FixLens frontend logic (chat-style)



const API_TEXT = "/api/text-diagnosis";

const API_PHOTO = "/api/photo-diagnosis";



document.addEventListener("DOMContentLoaded", () => {

  const btnText = document.getElementById("btn-text");

  const btnPhoto = document.getElementById("btn-photo");

  const btnSpeak = document.getElementById("btn-speak");

  const photoInput = document.getElementById("photo-input");



  const conversationBody = document.getElementById("conversation-body");



  const menuToggle = document.getElementById("menu-toggle");

  const menuOverlay = document.getElementById("menu-overlay");

  const menuClose = document.getElementById("menu-close");



  // ========== Helpers: Chat messages ==========



  function addMessage(role, text) {

    if (!conversationBody) return;



    const msg = document.createElement("div");

    msg.className = "message";



    const label = document.createElement("div");

    label.className = "message-label " + (role === "user" ? "user" : "ai");

    label.textContent = role === "user" ? "You" : "FixLens";



    const bubble = document.createElement("div");

    bubble.className = "message-bubble " + (role === "user" ? "user" : "ai");

    bubble.textContent = text;



    msg.appendChild(label);

    msg.appendChild(bubble);

    conversationBody.appendChild(msg);



    // Scroll to bottom

    conversationBody.scrollTop = conversationBody.scrollHeight;



    return bubble; // نرجع البابل عشان نقدر نحدّثه في حالة "Thinking…"

  }



  async function callApi(url, payload) {

    // رسالة AI مبدئية "Thinking..."

    const thinkingBubble = addMessage(

      "ai",

      "Thinking… analyzing your problem with FixLens AI."

    );



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

        thinkingBubble.textContent =

          "Something went wrong. Please try again in a moment.";

        return;

      }



      const data = await res.json();

      if (data && data.answer) {

        thinkingBubble.textContent = data.answer;

      } else {

        thinkingBubble.textContent =

          "No answer returned from FixLens AI. Please try again.";

      }

    } catch (err) {

      console.error(err);

      thinkingBubble.textContent =

        "Network error. Please check your connection and try again.";

    }

  }



  // ========== Buttons: Text / Photo / Voice ==========



  if (btnText) {

    btnText.addEventListener("click", () => {

      const description = window.prompt(

        "Describe the problem in your own words:"

      );

      if (!description || !description.trim()) return;



      // أضف رسالة المستخدم أولاً

      addMessage("user", description.trim());

      // ثم استدعاء الـ API

      callApi(API_TEXT, { description: description.trim() });

    });

  }



  if (btnPhoto && photoInput) {

    btnPhoto.addEventListener("click", () => {

      photoInput.value = ""; // reset

      photoInput.click();

    });



    photoInput.addEventListener("change", () => {

      const file = photoInput.files && photoInput.files[0];

      if (!file) return;



      // رسالة user تختصر الموضوع

      addMessage(

        "user",

        `Uploaded a photo: ${file.name || "image"} (FixLens will analyze it).`

      );



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

      // لسه placeholder – نطوره لاحقًا مع voice API

      alert("Voice mode is coming soon to FixLens 🔊");

    });

  }



  // ========== Menu overlay ==========



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



  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

      closeMenu();

    }

  });

});
