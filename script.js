// script.js – FixLens frontend logic (chat-style + recent diagnosis history)



const API_TEXT = "/api/text-diagnosis";

const API_PHOTO = "/api/photo-diagnosis";

const STORAGE_KEY = "fixlens_recent_history";



document.addEventListener("DOMContentLoaded", () => {

  const btnText = document.getElementById("btn-text");

  const btnPhoto = document.getElementById("btn-photo");

  const btnSpeak = document.getElementById("btn-speak");

  const photoInput = document.getElementById("photo-input");



  const conversationBody = document.getElementById("conversation-body");



  const menuToggle = document.getElementById("menu-toggle");

  const menuOverlay = document.getElementById("menu-overlay");

  const menuClose = document.getElementById("menu-close");



  // ========= History in localStorage =========



  function loadHistory() {

    try {

      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) return [];

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) return [];

      return parsed;

    } catch {

      return [];

    }

  }



  function saveHistory(history) {

    try {

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    } catch {

      // ignore

    }

  }



  let history = loadHistory(); // [{role, text, ts}, ...]



  // ========= Rendering messages =========



  function renderMessage(role, text) {

    if (!conversationBody) return null;



    const msg = document.createElement("div");

    msg.className = "message";



    const label = document.createElement("div");

    label.className = "message-label " + (role === "user" ? "user" : "ai");

    label.textContent = role === "user" ? "YOU" : "FIXLENS";



    const bubble = document.createElement("div");

    bubble.className = "message-bubble " + (role === "user" ? "user" : "ai");

    bubble.textContent = text;



    msg.appendChild(label);

    msg.appendChild(bubble);

    conversationBody.appendChild(msg);



    conversationBody.scrollTop = conversationBody.scrollHeight;



    return bubble;

  }



  // addMessage: يرسم ويخزّن في التاريخ

  function addMessage(role, text) {

    const bubble = renderMessage(role, text);



    const entry = {

      role,

      text,

      ts: Date.now(),

    };

    history.push(entry);



    // نخلي فقط آخر 10 رسائل حتى يبقى القسم خفيف

    if (history.length > 10) {

      history = history.slice(history.length - 10);

    }

    saveHistory(history);



    return bubble;

  }



  // عند فتح الصفحة: نرسم التاريخ السابق (بدون مضاعفة التخزين)

  history.forEach((entry) => {

    renderMessage(entry.role, entry.text);

  });



  // ========= API call =========



  async function callApi(url, payload) {

    // فقاعة التفكير الجديدة – Neural Orbit Animation

    const thinkingBubble = addMessage("ai", "");

    if (thinkingBubble) {

      thinkingBubble.classList.add("thinking");

      thinkingBubble.innerHTML = `

        <div class="thinking-main">

          Thinking… analyzing your problem with FixLens AI.

        </div>



        <div class="thinking-orbit" aria-hidden="true">

          <div class="thinking-core"></div>



          <div class="thinking-ring thinking-ring-outer">

            <div class="thinking-dot"></div>

          </div>



          <div class="thinking-ring thinking-ring-inner">

            <div class="thinking-dot"></div>

          </div>

        </div>

      `;



      history[history.length - 1].text =

        "Thinking… analyzing your problem with FixLens AI.";

      saveHistory(history);

    }



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

        if (thinkingBubble) {

          thinkingBubble.classList.remove("thinking");

          thinkingBubble.textContent =

            "Something went wrong. Please try again in a moment.";

          history[history.length - 1].text = thinkingBubble.textContent;

          saveHistory(history);

        }

        return;

      }



      const data = await res.json();

      const answer =

        (data && data.answer) ||

        "No answer returned from FixLens AI. Please try again.";



      if (thinkingBubble) {

        thinkingBubble.classList.remove("thinking");

        thinkingBubble.textContent = answer;

        history[history.length - 1].text = answer;

        saveHistory(history);

      }

    } catch (err) {

      console.error(err);

      if (thinkingBubble) {

        thinkingBubble.classList.remove("thinking");

        thinkingBubble.textContent =

          "Network error. Please check your connection and try again.";

        history[history.length - 1].text = thinkingBubble.textContent;

        saveHistory(history);

      }

    }

  }



  // ========= Buttons: Text / Photo / Voice =========



  if (btnText) {

    btnText.addEventListener("click", () => {

      const description = window.prompt(

        "Describe the problem in your own words:"

      );

      if (!description || !description.trim()) return;



      const cleaned = description.trim();

      addMessage("user", cleaned);

      callApi(API_TEXT, { description: cleaned });

    });

  }



  if (btnPhoto && photoInput) {

    btnPhoto.addEventListener("click", () => {

      photoInput.value = "";

      photoInput.click();

    });



    photoInput.addEventListener("change", () => {

      const file = photoInput.files && photoInput.files[0];

      if (!file) return;



      addMessage(

        "user",

        `Uploaded a photo: ${

          file.name || "image"

        } (FixLens will analyze it).`

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



  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

      closeMenu();

    }

  });

});
