// عناصر الواجهة

const menuToggle = document.getElementById("menu-toggle");

const menuOverlay = document.getElementById("menu-overlay");

const menuClose = document.getElementById("menu-close");



const chatInput = document.getElementById("chat-input");

const imageInput = document.getElementById("image-input");

const imageButton = document.getElementById("image-button");

const micButton = document.getElementById("mic-button");

const sendButton = document.getElementById("send-button");

const pipesMode = document.getElementById("pipes-mode");



let selectedImageFile = null;

let mediaRecorder = null;

let audioChunks = [];

let audioBlob = null;

let recording = false;



/* ========== MENU ========== */



if (menuToggle && menuOverlay && menuClose) {

  const openMenu = () => {

    menuOverlay.classList.add("is-open");

    menuOverlay.setAttribute("aria-hidden", "false");

  };



  const closeMenu = () => {

    menuOverlay.classList.remove("is-open");

    menuOverlay.setAttribute("aria-hidden", "true");

  };



  menuToggle.addEventListener("click", openMenu);

  menuClose.addEventListener("click", closeMenu);

  menuOverlay.addEventListener("click", (e) => {

    if (e.target === menuOverlay) closeMenu();

  });

}



/* ========== IMAGE UPLOAD ========== */



if (imageButton && imageInput) {

  imageButton.addEventListener("click", () => {

    imageInput.click();

  });



  imageInput.addEventListener("change", () => {

    const file = imageInput.files?.[0];

    if (file) {

      selectedImageFile = file;

      imageButton.textContent = "🖼️"; // علامة توضح أن صورة مختارة

    } else {

      selectedImageFile = null;

      imageButton.textContent = "📷";

    }

  });

}



/* ========== VOICE RECORD ========== */



async function toggleRecording() {

  if (!recording) {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream);

      audioChunks = [];



      mediaRecorder.ondataavailable = (e) => {

        if (e.data.size > 0) audioChunks.push(e.data);

      };



      mediaRecorder.onstop = () => {

        audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        stream.getTracks().forEach((t) => t.stop());

      };



      mediaRecorder.start();

      recording = true;

      micButton.textContent = "⏺";

    } catch (err) {

      console.error("Mic error", err);

      alert("Could not access microphone. Please check permissions.");

    }

  } else {

    mediaRecorder?.stop();

    recording = false;

    micButton.textContent = "🎤";

  }

}



if (micButton) {

  micButton.addEventListener("click", toggleRecording);

}



/* ========== QUICK MODE (PIPES & WIRES) ========== */



if (pipesMode) {

  pipesMode.addEventListener("click", () => {

    const template =

      "Scan for pipes, wires, and wall studs in this wall/floor. " +

      "Explain what risks I should know before I drill or cut.";

    chatInput.value = template;

    chatInput.focus();

  });

}



/* ========== SEND TO /api/brain ========== */



async function runDiagnosis() {

  const text = chatInput.value.trim();



  if (!text && !selectedImageFile && !audioBlob) {

    alert("Please describe the problem, upload a photo, or record a short voice note.");

    return;

  }



  const formData = new FormData();

  if (text) formData.append("description", text);

  if (selectedImageFile) formData.append("image", selectedImageFile);

  if (audioBlob) formData.append("voice", audioBlob, "voice.webm");



  sendButton.disabled = true;

  sendButton.textContent = "…";



  try {

    const res = await fetch("/api/brain", {

      method: "POST",

      body: formData,

    });



    let message = "FixLens processed your request.";

    if (res.ok) {

      const data = await res.json().catch(() => null);

      if (data && data.message) {

        message = data.message;

      } else if (data && data.diagnosis) {

        message = data.diagnosis;

      }

    } else {

      message = "There was a problem reaching FixLens. Please try again.";

    }



    // مؤقتاً نعرض النتيجة بـ alert — لاحقاً نعمل صندوق شات كامل

    alert(message);

  } catch (err) {

    console.error(err);

    alert("Network error. Please try again.");

  } finally {

    sendButton.disabled = false;

    sendButton.textContent = "➜";

  }

}



if (sendButton) {

  sendButton.addEventListener("click", runDiagnosis);

}



if (chatInput) {

  chatInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      runDiagnosis();

    }

  });

}
