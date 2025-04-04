// content.js
function createUkrainianButton() {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  `;

  const select = document.createElement('select');
  select.className = 'vc-fade-in rounded-md vc-focus-element vc-language-selector';
  select.style.cssText = `
    font-size: 11px;
    max-width: 110px;
    text-indent: 0px;
    position: static;
    padding: 4px 20px 4px 8px;
    background-color: white;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 4px center;
    background-size: 12px;
    transition: all 0.2s ease;
  `;

  select.addEventListener('focus', () => {
    select.style.borderColor = '#3b82f6';
    select.style.boxShadow = '0 0 0 1px #3b82f6';
  });

  select.addEventListener('blur', () => {
    select.style.borderColor = '#e5e7eb';
    select.style.boxShadow = 'none';
  });

  const languages = [
    { code: 'uk-UA', name: 'Українська' },
    { code: 'ru-RU', name: 'Pусский' },
    { code: 'en-US', name: 'English (US)' }
  ];

  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    select.appendChild(option);
  });

  const button = document.createElement('button');
  button.id = 'ukrainian-voice-btn';
  button.innerHTML = '🎤';
  button.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    width: 28px;
    background-color: #3871e0;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `;
  
  let recognition = null;
  let isRecording = false;
  let currentTranscript = '';
  let isFirstResult = true;
  
  function getCurrentTextareaContent() {
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      return promptTextarea.textContent.trim();
    }
    return '';
  }
  
  function updateTextarea(text) {
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      // Create a new paragraph element
      const p = document.createElement('p');
      p.textContent = text;
      
      // Clear existing content
      promptTextarea.innerHTML = '';
      
      // Append the new paragraph
      promptTextarea.appendChild(p);
      
      // Add a trailing break
      const br = document.createElement('br');
      br.className = 'ProseMirror-trailingBreak';
      promptTextarea.appendChild(br);
      
      // Update the hidden textarea
      const textarea = promptTextarea.parentElement.querySelector('textarea');
      if (textarea) {
        textarea.value = text;
      }
    }
  }
  
  function toggleRecording() {
    if (!isRecording) {
      // Start recording
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = select.value; // Use selected language
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        isRecording = true;
        isFirstResult = true;
        // Always use the current textbox content
        currentTranscript = getCurrentTextareaContent();
        button.style.backgroundColor = '#ff6666';
        button.innerHTML = '🎤';
      };
      
      recognition.onend = () => {
        if (isRecording) {
          // If recording was stopped by the system, restart it
          recognition.start();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        button.style.backgroundColor = '#3871e0';
        button.innerHTML = '🎤';
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          // We have a final result
          if (isFirstResult) {
            // For the first result, append to existing content
            currentTranscript = currentTranscript + ' ' + finalTranscript;
            isFirstResult = false;
          } else {
            // For subsequent results, update the current transcript
            currentTranscript = currentTranscript + ' ' + finalTranscript;
          }
        }
        
        // Show interim results in real-time
        const displayText = currentTranscript + (interimTranscript ? ' ' + interimTranscript : '');
        updateTextarea(displayText);
      };
      
      recognition.start();
    } else {
      // Stop recording
      isRecording = false;
      recognition.stop();
      button.style.backgroundColor = '#3871e0';
      button.innerHTML = '🎤';
      
      // Keep the current transcript in the textarea
      updateTextarea(currentTranscript);
    }
  }
  
  // Add click event listener
  button.addEventListener('click', toggleRecording);
  
  // Add keyboard shortcut listener
  document.addEventListener('keydown', (event) => {
    // Check for Ctrl+X
    if (event.ctrlKey && event.key.toLowerCase() === 'x') {
      event.preventDefault(); // Prevent default browser behavior
      toggleRecording();
    }
  });

  // Add the select and button to the container
  container.appendChild(select);
  container.appendChild(button);

  return container;
}

function addButtonToContainer() {
  // Check if button already exists
  if (!document.getElementById('ukrainian-voice-btn')) {
    const container = createUkrainianButton();
    document.body.appendChild(container);
  }
}

// Create a MutationObserver to watch for changes
const observer = new MutationObserver((mutations) => {
  // Check if our button exists
  if (!document.getElementById('ukrainian-voice-btn')) {
    addButtonToContainer();
  }
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial button addition
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtonToContainer);
} else {
  addButtonToContainer();
}