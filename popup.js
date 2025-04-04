// popup.js
document.getElementById("start-recording").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "uk-UA";
    recognition.start();
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      insertTextIntoChatGPT(transcript);
    };
  });
  
  function insertTextIntoChatGPT(text) {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }