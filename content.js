// content.js
function createUkrainianButton() {
  const button = document.createElement('button');
  button.id = 'ukrainian-voice-btn';
  button.innerHTML = '🎤 Ukrainian';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #10a37f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
    font-size: 14px;
  `;
  
  button.addEventListener('click', () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'uk-UA';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      button.style.backgroundColor = '#0d8a6d';
      button.innerHTML = '🎤 Recording...';
    };
    
    recognition.onend = () => {
      button.style.backgroundColor = '#10a37f';
      button.innerHTML = '🎤 Ukrainian';
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      button.style.backgroundColor = '#10a37f';
      button.innerHTML = '🎤 Ukrainian';
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = transcript;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    
    recognition.start();
  });
  
  document.body.appendChild(button);
}

// Wait for the page to load and then inject the button
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createUkrainianButton);
} else {
  createUkrainianButton();
} 