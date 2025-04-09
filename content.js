// content.js
function createUkrainianButton() {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    position: fixed;
    bottom: 40px;
    right: 15px;
    z-index: 1000;
  `;

  const select = document.createElement('select');
  select.className = 'vc-fade-in rounded-md vc-focus-element vc-language-selector';
  select.style.cssText = `
    font-size: 12px;
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
  button.title = 'Press Ctrl + X to start/stop recording';
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
      const scrollTop = promptTextarea.scrollTop;
      promptTextarea.textContent = text;
      promptTextarea.scrollTop = scrollTop;
      
      const textarea = promptTextarea.parentElement.querySelector('textarea');
      if (textarea) {
        textarea.value = text;
      }
    }
  }

  function clearTextarea() {
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      promptTextarea.textContent = '';
      const textarea = promptTextarea.parentElement.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
      }
    }
    currentTranscript = '';
  }
  
  function toggleRecording() {
    if (!isRecording) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = select.value;
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        isRecording = true;
        isFirstResult = true;
        currentTranscript = getCurrentTextareaContent();
        button.style.backgroundColor = '#ff6666';
        button.innerHTML = '🎤';
      };
      
      recognition.onend = () => {
        if (isRecording) {
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
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          if (isFirstResult) {
            currentTranscript = currentTranscript + ' ' + finalTranscript;
            isFirstResult = false;
          } else {
            currentTranscript = currentTranscript + ' ' + finalTranscript;
          }
        }
        
        const displayText = currentTranscript + (interimTranscript ? ' ' + interimTranscript : '');
        updateTextarea(displayText);
      };
      
      recognition.start();
    } else {
      isRecording = false;
      recognition.stop();
      button.style.backgroundColor = '#3871e0';
      button.innerHTML = '🎤';
      updateTextarea(currentTranscript);
    }
  }
  
  button.addEventListener('click', toggleRecording);
  
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'x') {
      event.preventDefault();
      toggleRecording();
    }
  });

  function setupMessageObserver() {
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      sendButton.addEventListener('click', () => {
        if (isRecording) {
          toggleRecording();
        }
        setTimeout(clearTextarea, 100);
      });
    }
  }

  setupMessageObserver();

  const messageObserver = new MutationObserver((mutations) => {
    setupMessageObserver();
  });

  messageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  container.appendChild(select);
  container.appendChild(button);

  return container;
}

async function addButtonToContainer() {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated && !document.getElementById('ukrainian-voice-btn')) {
    const container = createUkrainianButton();
    document.body.appendChild(container);
  } else if (!isAuthenticated) {
    const existingButton = document.getElementById('ukrainian-voice-btn');
    if (existingButton) {
      existingButton.parentElement.remove();
    }
  }
}

// Create a MutationObserver to watch for changes
const observer = new MutationObserver((mutations) => {
  addButtonToContainer();
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for authentication state changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.isLoggedIn || changes.loginTime)) {
    addButtonToContainer();
  }
});

// Initial button addition
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtonToContainer);
} else {
  addButtonToContainer();
}

// Function to check if user is authenticated
async function checkAuth() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['isLoggedIn', 'loginTime'], function(result) {
            if (result.isLoggedIn) {
                // Check if session has expired (24 hours)
                const now = new Date().getTime();
                const loginTime = result.loginTime || 0;
                const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
                
                resolve(hoursSinceLogin < 24);
            } else {
                resolve(false);
            }
        });
    });
}