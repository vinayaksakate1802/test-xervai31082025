document.addEventListener('DOMContentLoaded', function () {
  const chatbotContainer = document.getElementById('xervai-chatbot');
  const toggleButton = chatbotContainer.querySelector('.chatbot-toggle');

  // Create chatbot window
  const chatbotWindow = document.createElement('div');
  chatbotWindow.className = 'chatbot-window';
  chatbotWindow.innerHTML = `
    <div class="chatbot-header">Xerv-Ai Chatbot</div>
    <div class="chatbot-body"></div>
    <div class="chatbot-footer">
      <input type="text" class="chatbot-input" placeholder="Type your message...">
      <button class="chatbot-send">Send</button>
    </div>
  `;
  chatbotContainer.appendChild(chatbotWindow);

  const chatbotBody = chatbotWindow.querySelector('.chatbot-body');
  const chatbotInput = chatbotWindow.querySelector('.chatbot-input');
  const sendButton = chatbotWindow.querySelector('.chatbot-send');

  toggleButton.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
  });

  function addMessage(content, isUser = false) {
    const message = document.createElement('div');
    message.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
    message.textContent = content;
    chatbotBody.appendChild(message);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  async function fetchSitemap() {
    try {
      const response = await fetch('/sitemap.xml');
      if (!response.ok) throw new Error('Failed to fetch sitemap');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const urls = Array.from(xml.getElementsByTagName('url')).map(url => url.getElementsByTagName('loc')[0].textContent);
      return urls;
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      return [];
    }
  }

  async function handleUserInput() {
    const userMessage = chatbotInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    chatbotInput.value = '';

    if (userMessage.toLowerCase().includes('contact')) {
      addMessage('You can reach us at test01@gmail.com or fill out the contact form on our website.');
    } else if (userMessage.toLowerCase().includes('services')) {
      addMessage('We offer Managed IT, Cybersecurity, Cloud, AI, DevOps, Data Analytics, and more. Check our services page for details!');
    } else {
      const sitemapUrls = await fetchSitemap();
      const matchedUrl = sitemapUrls.find(url => userMessage.toLowerCase().includes(url.toLowerCase().split('/').pop()));
      if (matchedUrl) {
        addMessage(`Learn more about this topic here: ${matchedUrl}`);
      } else {
        addMessage('I’m not sure about that. Try asking about our services or contact details!');
      }
    }
  }

  sendButton.addEventListener('click', handleUserInput);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  addMessage('Welcome to Xerv-Ai! How can I assist you today?');
});
