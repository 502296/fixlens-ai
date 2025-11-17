// script.js



document.addEventListener("DOMContentLoaded", () => {

  /* =========

     1) Panels from header menu (both pages)

     ========= */

  const panelLinks = document.querySelectorAll('[href^="#panel-"]');

  const panels = document.querySelectorAll(".info-panel");



  function openPanel(id) {

    panels.forEach((panel) => {

      if (panel.id === id) {

        panel.classList.remove("is-hidden");

      } else {

        panel.classList.add("is-hidden");

      }

    });



    const target = document.getElementById(id);

    if (target) {

      target.scrollIntoView({ behavior: "smooth", block: "start" });

    }

  }



  panelLinks.forEach((link) => {

    link.addEventListener("click", (e) => {

      // لو الرابط Home لا نفتح بانل

      const href = link.getAttribute("href") || "";

      if (!href.startsWith("#panel-")) return;



      e.preventDefault();

      const id = href.replace("#", "");

      openPanel(id);

    });

  });



  /* =========

     2) Hero buttons on index.html → go to diagnosis.html

     ========= */

  const modeButtons = document.querySelectorAll("[data-go-mode]");

  modeButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

      const mode = btn.getAttribute("data-go-mode") || "photo";

      window.location.href = `diagnosis.html?mode=${encodeURIComponent(mode)}`;

    });

  });



  /* =========

     3) Diagnosis page: upload + text + voice + send to /api/brain

     ========= */

  const demoCard = document.querySelector(".demo-card");

  if (!demoCard) {

    // لسنا في diagnosis.html، نخرج.

    return;

  }



  const urlParams = new URLSearchParams(window.location.search);

  const initialMode = urlParams.get("mode") || "photo";



  const groupPhoto = document.getElementById("group-photo");

  const groupText = document.getElementById("group-text");

  const groupVoice = document.getElementById("group-voice");



  function clearHighlights() {

    [groupPhoto, groupText, groupVoice].forEach((g) => {

      if (g) g.classList.remove("highlight");

    });

  }



  function highlightMode(mode) {

    clearHighlights();

    if (mode === "photo" && groupPhoto) groupPhoto.classList.add("highlight");

    if (mode === "text" && groupText) groupText.classList.add("highlight");

    if (mode === "voice" && groupVoice) groupVoice.classList.add("highlight");

  }



  highlightMode(initialMode);



  const imageInput = document.getElementById("image-input");

  const descriptionInput = document.getElementById("description-input");

  const recordBtn = document.getElementById("record-btn");

  const recordStatus = document.getElementById("record-status");

  const runDemoBtn = document.getElementById("run-demo-btn");

  const demoStatus = document.getElementById("demo-status");

  const demoResult = document.getElementById("demo-result");



  let mediaRecorder = null;

  let audioChunks = [];

  let isRecording = false;



  // ===== Voice recording =====

  if (recordBtn) {

    recordBtn.addEventListener("click", async () => {

      if (!isRecording) {

        if (!navigator.mediaDevices || !window.MediaRecorder) {

          recordStatus.textContent =

            "Voice recording is not supported on this device.";

          return;

        }



        try {

          const stream = await navigator.mediaDevices.getUserMedia({

            audio: true,

          });

          mediaRecorder = new MediaRecorder(stream);

          audioChunks = [];



          mediaRecorder.ondataavailable = (event) => {

            if (event.data.size > 0) {

              audioChunks.push(event.data);

            }

          };



          mediaRecorder.onstop = () => {

            stream.getTracks().forEach((t) => t.stop());

            recordStatus.textContent = audioChunks.length

              ? "Voice note recorded."

              : "No audio captured.";

          };



          mediaRecorder.start();

          isRecording = true;

          recordBtn.textContent = "⏹️ Stop recording";

          recordStatus.textContent = "Recording… speak near your phone.";

        } catch (err) {

          console.error("Error starting recording:", err);

          recordStatus.textContent = "Could not access microphone.";

        }

      } else {

        if (mediaRecorder && mediaRecorder.state !== "inactive") {

          mediaRecorder.stop();

        }

        isRecording = false;

        recordBtn.textContent = "🎙️ Record voice";

      }

    });

  }



  // ===== Run AI diagnosis =====

  if (runDemoBtn) {

    runDemoBtn.addEventListener("click", async () => {

      const file = imageInput?.files?.[0] || null;

      const description = (descriptionInput?.value || "").trim();



      if (!file && !description && !audioChunks.length) {

        demoStatus.textContent =

          "Please upload a photo, add a description, or record a voice note.";

        return;

      }



      demoStatus.textContent = "Sending to FixLens AI brain…";

      demoResult.innerHTML =

        '<p class="placeholder-text">Thinking… please wait a moment.</p>';



      try {

        const formData = new FormData();

        if (file) formData.append("image", file);

        if (description) formData.append("description", description);



        if (audioChunks.length) {

          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

          formData.append("audio", audioBlob, "voice-note.webm");

        }



        // 👇 هنا نستخدم /api/brain (موجود عندك في فولدر api)

        const response = await fetch("/api/brain", {

          method: "POST",

          body: formData,

        });



        if (!response.ok) {

          throw new Error("API returned status " + response.status);

        }



        const data = (await response.json().catch(() => null)) || {};

        const text =

          data.diagnosis ||

          data.result ||

          data.message ||

          "FixLens processed your request, but no readable message was returned.";



        demoResult.innerHTML =

          "<p>" + text.replace(/\n/g, "<br>") + "</p>";

        demoStatus.textContent = "Diagnosis complete.";

      } catch (err) {

        console.error("Demo error:", err);

        demoResult.innerHTML =

          '<p class="placeholder-text">Something went wrong while talking to the AI. Please try again in a moment.</p>';

        demoStatus.textContent = "Error while contacting FixLens AI.";

      }

    });

  }

});
