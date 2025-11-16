const chatContainer = document.getElementById("chat-container");

const userInput = document.getElementById("user-input");



// Add message to chat UI

function addMessage(content, isUser = false) {

  const bubble = document.createElement("div");

  bubble.className = isUser ? "user-bubble" : "ai-bubble";

  bubble.textContent = content;

  chatContainer.appendChild(bubble);



  // Scroll to bottom

  chatContainer.scrollTop = chatContainer.scrollHeight;

}



// Loader (animated)

function showLoader() {

  const loader = document.createElement("div");

  loader.className = "ai-bubble";

  loader.id = "loader";

  loader.textContent = "Analyzing your photo and description...";

  chatContainer.appendChild(loader);

}



function hideLoader() {

  const loader = document.getElementById("loader");

  if (loader) loader.remove();

}



// Send message to backend API

async function sendMessage() {

  const text = userInput.value.trim();

  if (!text) return;



  addMessage(text, true); // user bubble

  userInput.value = ""; // clear input



  showLoader();



  try {

    const response = await fetch("/api/fixlens", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ description: text })

    });



    const data = await response.json();

    hideLoader();



    if (data.reply) {

      addMessage(data.reply, false);

    } else {

      addMessage("Something went wrong. Try again.", false);

    }

  } catch (error) {

    hideLoader();

    addMessage("Server error. Please try again later.", false);

  }

}
