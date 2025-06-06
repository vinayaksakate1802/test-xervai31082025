const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotContainer = document.querySelector('.chatbot-container');

let chatWindow = null;
let responses = {};
let userName = null;

function initializeChatbot() {
  fetch('/assets/data/chatbot-data.json')
    .then(response => response.json())
    .then(data => {
      responses = data;
    })
    .catch(error => console.error('Error loading chatbot data:', error));

  chatbotToggle.addEventListener('click', toggleChatWindow);
}

function toggleChatWindow() {
  if (!chatWindow) {
    createChatWindow();
  } else {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
  }
}

function createChatWindow() {
  chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window';
  chatWindow.style.position = 'fixed';
  chatWindow.style.bottom = '80px';
  chatWindow.style.right = '20px';
  chatWindow.style.width = '300px';
  chatWindow.style.height = '400px';
  chatWindow.style.background = '#fff';
  chatWindow.style.border = '1px solid #eaeaea';
  chatWindow.style.borderRadius = '8px';
  chatWindow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  chatWindow.style.display = 'flex';
  chatWindow.style.flexDirection = 'column';
  chatWindow.style.zIndex = '1001';

  const chatHeader = document.createElement('div');
  chatHeader.style.background = '#ff8c40';
  chatHeader.style.color = '#fff';
  chatHeader.style.padding = '10px';
  chatHeader.style.borderRadius = '8px 8px 0 0';
  chatHeader.style.display = 'flex';
  chatHeader.style.alignItems = 'center';
  chatHeader.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.86-.81-5.21-2.12.69-1.29 2.05-2.18 3.71-2.18h2.99c1.66 0 3.02.89 3.71 2.18C15.86 19.19 14.03 20 12 20z"/>
    </svg>
    <span>Xerv-Ai</span>
    <span style="float:right;cursor:pointer;">×</span>
  `;
  chatHeader.querySelector('span:last-child').addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  const chatBody = document.createElement('div');
  chatBody.className = 'chat-body';
  chatBody.style.flex = '1';
  chatBody.style.padding = '10px';
  chatBody.style.overflowY = 'auto';
  chatBody.innerHTML = '<div class="bot-message">Hey there, I’m Xerv-Ai, your slick guide to all things XervAi. What’s on your mind?</div>';

  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type your question...';
  chatInput.style.width = '100%';
  chatInput.style.padding = '10px';
  chatInput.style.border = 'none';
  chatInput.style.borderTop = '1px solid #eaeaea';
  chatInput.style.borderRadius = '0 0 8px 8px';

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
      handleUserMessage(chatInput.value.trim());
      chatInput.value = '';
    }
  });

  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(chatBody);
  chatWindow.appendChild(chatInput);
  chatbotContainer.appendChild(chatWindow);
}

// -------------------------------------------------------------------
// Quick Reply Handler for Chatbot Fallback Quick Replies
function handleQuickReply(choice) {
  const chatBody = document.querySelector('.chat-body');
  let simulatedMessage = '';

  if (choice === "services") {
    simulatedMessage = 'Tell me about your services';
  } else if (choice === "contact") {
    simulatedMessage = 'I would like to contact you';
  }
  
  if (chatBody) {
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = simulatedMessage;
    chatBody.appendChild(userMessage);
  }
  
  if (typeof handleUserMessage === 'function') {
    handleUserMessage(simulatedMessage);
  } else {
    console.warn("handleUserMessage function is not defined.");
  }
}
window.handleQuickReply = handleQuickReply;

// -------------------------------------------------------------------
// Fuzzy Matching Chatbot Logic

// Preprocess function: remove punctuation and extra whitespace, convert to lower case.
function preprocess(input) {
  return input.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

// Levenshtein distance function
function levenshteinDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const matrix = [];
  
  // Initialize first row and column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy matching function, using preprocessing for both user input and each pattern
function getIntent(userInput, responses, threshold = 5) {
  userInput = preprocess(userInput);
  let bestIntent = null;
  let bestDistance = Infinity;
  for (const intent in responses.intents) {
    const patterns = responses.intents[intent].patterns;
    for (const pattern of patterns) {
      const processedPattern = preprocess(pattern);
      const distance = levenshteinDistance(userInput, processedPattern);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIntent = intent;
      }
    }
  }
  return bestDistance <= threshold ? bestIntent : null;
}

// -------------------------------------------------------------------
// Handle User Message with Fuzzy Matching
function handleUserMessage(message) {
  const chatBody = chatWindow.querySelector('.chat-body');
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessage.style.margin = '10px';
  userMessage.style.padding = '8px';
  userMessage.style.background = '#f9f6f2';
  userMessage.style.borderRadius = '8px';
  userMessage.style.textAlign = 'right';
  userMessage.textContent = message;
  chatBody.appendChild(userMessage);

  // Get bot response using fuzzy matching logic
  const response = getBotResponse(message.toLowerCase(), message);
  const botMessage = document.createElement('div');
  botMessage.className = 'bot-message';
  botMessage.style.margin = '10px';
  botMessage.style.padding = '8px';
  botMessage.style.background = '#ff8c40';
  botMessage.style.color = '#fff';
  botMessage.style.borderRadius = '8px';
  // Use innerHTML so that clickable links render properly
  botMessage.innerHTML = response;
  chatBody.appendChild(botMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Update getBotResponse to use fuzzy matching
function getBotResponse(message, originalMessage) {
  // Look for an introductory name pattern first
  const nameMatch = message.match(/my name is (\w+)/i);
  if (nameMatch) {
    userName = nameMatch[1];
    return `Nice to meet you, ${userName}! I’m Xerv-Ai, the smoothest AI this side of the cloud. What’s up?`;
  }

  // Use fuzzy matching to determine the best intent
  const intent = getIntent(message, responses, 5);
  if (intent) {
    // For specific intents, notify the server if needed
    if (intent === 'schedule_call') {
      const timeMatch = originalMessage.match(/(\d{1,2}[ -]?\w{3}[ -]?\d{4})\s*(?:at)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?\s*(\w{2,3})?/i);
      if (timeMatch) {
        const [, date, time, timezone] = timeMatch;
        notifyServer('schedule', originalMessage, { preferredTime: `${date} ${time || ''}`, timezone: timezone || 'Not specified' });
      } else {
        notifyServer('schedule', originalMessage);
      }
    } else if (intent === 'phone_number') {
      notifyServer('phone', originalMessage);
    }
    return responses.intents[intent].response;
  }
  // If no intent is matched closely, return a fallback response.
  return responses.fallbacks[Math.floor(Math.random() * responses.fallbacks.length)];
}

// -------------------------------------------------------------------
// Server notification (for scheduling/phone alerts)
function notifyServer(type, message, details = {}) {
  const payload = {
    type,
    name: userName,
    message,
    ...details
  };

  fetch('/chatbot-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => console.log('Notification sent:', data))
    .catch(error => console.error('Error sending notification:', error));
}

document.addEventListener('DOMContentLoaded', initializeChatbot);
 
