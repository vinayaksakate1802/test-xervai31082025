const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotContainer = document.querySelector('.chatbot-container');

let chatWindow = null;
let responses = {};
let userName = null;
let lastIntent = null; // <-- Short-term memory

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
  chatWindow.style = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    z-index: 1001;
  `;

  const chatHeader = document.createElement('div');
  chatHeader.style = `
    background: #ff8c40;
    color: #fff;
    padding: 10px;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  chatHeader.innerHTML = `
    <span><strong>Xerv-Ai</strong></span>
    <span style="cursor:pointer;">×</span>
  `;
  chatHeader.querySelector('span:last-child').addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  const chatBody = document.createElement('div');
  chatBody.className = 'chat-body';
  chatBody.style = `
    flex: 1;
    padding: 10px;
    overflow-y: auto;
  `;
  chatBody.innerHTML = `<div class="bot-message">Hey there, I’m Xerv-Ai, your slick guide to all things XervAi. What’s on your mind?</div>`;

  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type your question...';
  chatInput.style = `
    width: 100%;
    padding: 10px;
    border: none;
    border-top: 1px solid #eaeaea;
    border-radius: 0 0 8px 8px;
  `;
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

function handleQuickReply(choice) {
  const chatBody = document.querySelector('.chat-body');
  let simulatedMessage = choice === "services" ? 'Tell me about your services' : 'I would like to contact you';

  if (chatBody) {
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = simulatedMessage;
    chatBody.appendChild(userMessage);
  }

  if (typeof handleUserMessage === 'function') {
    handleUserMessage(simulatedMessage);
  }
}
window.handleQuickReply = handleQuickReply;

// Utility: preprocessing
function preprocess(input) {
  return input.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

// Utility: Levenshtein Distance
function levenshteinDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy intent matcher
function getIntent(userInput, responses, threshold = 3) {
  userInput = preprocess(userInput);
  let bestIntent = null;
  let bestDistance = Infinity;
  for (const intent in responses.intents) {
    for (const pattern of responses.intents[intent].patterns) {
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

// Core: handle user message
function handleUserMessage(message) {
  const chatBody = chatWindow.querySelector('.chat-body');
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessage.style = `
    margin: 10px;
    padding: 8px;
    background: #f9f6f2;
    border-radius: 8px;
    text-align: right;
  `;
  userMessage.textContent = message;
  chatBody.appendChild(userMessage);

  const response = getBotResponse(message.toLowerCase(), message);
  const botMessage = document.createElement('div');
  botMessage.className = 'bot-message';
  botMessage.style = `
    margin: 10px;
    padding: 8px;
    background: #ff8c40;
    color: #fff;
    border-radius: 8px;
  `;
  botMessage.innerHTML = response;
  chatBody.appendChild(botMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Context-aware response handler
function getBotResponse(message, originalMessage) {
  const nameMatch = message.match(/my name is (\w+)/i);
  if (nameMatch) {
    userName = nameMatch[1];
    return `Nice to meet you, ${userName}! I’m Xerv-Ai, the smoothest AI this side of the cloud. What’s up?`;
  }

  let intent = getIntent(message, responses, 5);

  // Context-based follow-ups
  if (!intent && lastIntent === 'services') {
    if (/azure/i.test(message)) return responses.intents.azure_services.response;
    if (/aws/i.test(message)) return responses.intents.aws_services.response;
    if (/gcp|google cloud/i.test(message)) return responses.intents.gcp_services.response;
    if (/migrat/i.test(message)) {
      return `<div style='text-align:center;'>We do mailbox, SharePoint, tenant-to-tenant, and legacy migrations. Learn more: <a href='https://xervai.com/migration' class='button-link' target='_blank'>Migration Services</a></div>`;
    }
  }

  if (intent) {
    lastIntent = intent;

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

  return responses.fallbacks[Math.floor(Math.random() * responses.fallbacks.length)];
}

// Notify server (optional)
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
