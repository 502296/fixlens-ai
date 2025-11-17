/* ------------------------------------------------------

   FIXLENS – Image Upload + Text Input + Voice

-------------------------------------------------------*/



// ---------- TEXT INPUT ----------

const describeForm = document.getElementById("describe-form");

const describeInput = document.getElementById("describe-input");



if (describeForm) {

  describeForm.addEventListener("submit", async (e) => {

    e.preventDefault();



    const text = describeInput.value.trim();

    if (!text) return;



    sendToFixLens({ text });

  });

}







// ---------- IMAGE UPLOAD ----------

const photoInput = document.getElementById("photo-input");



if (photoInput) {

  photoInput.addEventListener("change", async () => {

    const file = photoInput.files[0];

    if (!file) return;



    const reader = new FileReader();



    reader.onloadend = () => {

      const base64Image = reader.result.split(",")[1];

      sendToFixLens({ image: base64Image });

    };



    reader.readAsDataURL(file);

  });

}







// ---------- VOICE INPUT ----------

let recognition;



const speakBtn = document.getElementById("speak-btn");

const speakIcon = document.getElementById("speak-icon");



if ("webkitSpeechRecognition" in window) {

  recognition = new webkitSpeechRecognition();

  recognition.lang = "en-US";

  recognition.interimResults = false;

  recognition.continuous = false;



  recognition.onstart = () => {

    if (speakIcon) speakIcon.style.opacity = "1";

  };



  recognition.onend = () => {

    if (speakIcon) speakIcon.style.opacity = "0.5";

  };



  recognition.onresult = (event) => {

    const text = event.results[0][0].transcript;

    sendToFixLens({ text });

  };

}



if (speakBtn) {

  speakBtn.addEventListener("click", () => {

    if (recognition) recognition.start();

  });

}







// ------------------------------------------------------

// SEND TO FIXLENS API

// ------------------------------------------------------

async function sendToFixLens(payload) {

  const conversationBox = document.getElementById("conversation-box");



  if (conversationBox) {

    conversationBox.innerHTML = "Analyzing… Please wait ⏳";

  }



  try {

    const res = await fetch("/api/fixlens", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),

    });



    const data = await res.json();



    if (conversationBox) {

      if (data.error) {

        conversationBox.innerHTML = "⚠️ Error: " + data.error;

      } else {

        conversationBox.innerHTML = data.result;

      }

    }

  } catch (err) {

    if (conversationBox) {

      conversationBox.innerHTML = "⚠️ Network error — please try again.";

    }

  }

}







// ------------------------------------------------------

// ROTATING CIRCLE TEXT (PERFECT 360°)

// ------------------------------------------------------

const circleText = document.querySelector(".hero-lens-text");

let rotation = 0;



function animateText() {

  rotation += 0.12; // speed (higher = faster)

  circleText.setAttribute("transform", `rotate(${rotation} 152 152)`);

  requestAnimationFrame(animateText);

}



if (circleText) {

  requestAnimationFrame(animateText);

}
