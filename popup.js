// popup.js
document.getElementById("start-recording")?.addEventListener("click", () => {
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

document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    const userIdInput = document.getElementById('userId');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const errorMessage = document.getElementById('errorMessage');

    // Check if user is already logged in and session hasn't expired
    chrome.storage.local.get(['isLoggedIn', 'userId', 'userName', 'loginTime'], function(result) {
        if (result.isLoggedIn) {
            // Check if session has expired (24 hours)
            const now = new Date().getTime();
            const loginTime = result.loginTime || 0;
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursSinceLogin < 24) {
                showMainContent(result.userName);
            } else {
                // Session expired, clear storage
                chrome.storage.local.clear();
                showLoginForm();
            }
        }
    });

    loginButton.addEventListener('click', async function() {
        const userId = userIdInput.value.trim();
        errorMessage.style.display = 'none';
        
        try {
            const response = await fetch('https://interview-coder-access-verify.vercel.app/verify-user/' + userId);
            const data = await response.json();
            
            if (data.exists) {
                // Save login state and user info with timestamp
                chrome.storage.local.set({
                    isLoggedIn: true,
                    userId: data.user.userId,
                    userName: data.user.name,
                    loginTime: new Date().getTime()
                }, function() {
                    showMainContent(data.user.name);
                });
            } else {
                errorMessage.textContent = 'User not found';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'Error verifying user. Please try again.';
            errorMessage.style.display = 'block';
            console.error('Error:', error);
        }
    });

    logoutButton.addEventListener('click', function() {
        chrome.storage.local.clear(function() {
            showLoginForm();
        });
    });

    function showMainContent(userName) {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Update welcome message with user's name
        const welcomeMessage = document.querySelector('#mainContainer p');
        if (welcomeMessage && userName) {
            welcomeMessage.textContent = `Welcome, ${userName}!`;
        }
    }

    function showLoginForm() {
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        userIdInput.value = '';
    }
});