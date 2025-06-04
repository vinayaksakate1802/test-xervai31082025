document.addEventListener('DOMContentLoaded', () => {
  const chatbotContainer = document.getElementById('xervai-chatbot');
  const chatbotIcon = document.querySelector('.chatbot-icon');
  const chatbotBody = document.createElement('div');
  chatbotBody.className = 'chatbot-body';
  chatbotBody.style.display = 'none';
  const chatMessages = document.createElement('div');
  chatMessages.className = 'chat-messages';
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type your question...';
  chatInput.className = 'chat-input';
  chatbotBody.appendChild(chatMessages);
  chatbotBody.appendChild(chatInput);
  chatbotContainer.appendChild(chatbotBody);

  const services = [
    { name: 'Artificial Intelligence', url: 'https://xervai.com/ai', desc: 'Leverage Azure and AWS AI for predictive analytics and automation.' },
    { name: 'Cybersecurity', url: 'https://xervai.com/cybersecurity', desc: 'Secure your business with SSO, MFA, and threat detection.' },
    { name: 'Cloud', url: 'https://xervai.com/cloud', desc: 'Scale with secure, flexible Azure and AWS cloud solutions.' },
    { name: 'Data Analytics', url: 'https://xervai.com/data-analytics', desc: 'Unlock insights with advanced analytics on Azure and AWS.' },
    { name: 'DevOps & Automation', url: 'https://xervai.com/devops', desc: 'Streamline CI/CD with Azure DevOps and AWS automation.' },
    { name: 'Engineering Solutions', url: 'https://xervai.com/engineering-solutions', desc: 'Custom engineering for complex challenges.' },
    { name: 'Managed IT & Consulting', url: 'https://xervai.com/it-consulting', desc: 'Optimize IT with SailPoint, AD, ADFS, and break-fix expertise.' },
    { name: 'Migration', url: 'https://xervai.com/migration', desc: 'Seamless cloud migrations to Azure and AWS.' },
    { name: 'On Premise & Legacy Apps', url: 'https://xervai.com/onpremise', desc: 'Modernize legacy systems with hybrid cloud integration.' },
    { name: 'Startup Zone', url: 'https://xervai.com/startup-zone', desc: 'Accelerate startups with cost-effective IT solutions.' },
    { name: 'Smart Apps Development', url: 'https://xervai.com/smartapps', desc: 'Build AI-powered apps for superior performance.' },
    { name: 'Digital Transformation', url: 'https://xervai.com/go-digital', desc: 'Reimagine processes with end-to-end digital strategies.' }
  ];

  const sendMessage = async (userMessage, botResponse) => {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = userMessage;
    chatMessages.appendChild(userDiv);

    const botDiv = document.createElement('div');
    botDiv.className = 'bot-message';
    botDiv.textContent = botResponse;
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      await fetch('/chatbot-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
    } catch (error) {
      console.error('Error notifying server:', error);
    }
  };

  const handleQuery = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('contact')) {
      return `Reach me at test01@gmail.com or fill out our contact form at https://xervai.com/contact-us. What's on your mind?`;
    } else if (msg.includes('name') || msg.includes('who are you')) {
      return `I'm Xerv-Ai, your suave AI assistant with a knack for solving tech puzzles. Think of me as your guide to XervAi’s world-class solutions. What's your next question?`;
    } else if (msg.includes('services') || msg.includes('offer')) {
      return `XervAi delivers cutting-edge IT solutions: AI, Cybersecurity, Cloud, DevOps, Data Analytics, and more, powered by Azure, AWS, and SailPoint. Check out https://xervai.com/services for the full lineup. Want details on any specific service?`;
    } else if (msg.includes('azure')) {
      return `Azure is Microsoft’s cloud platform, and we’re wizards at using it for scalable, secure solutions like AI, analytics, and migrations. Learn more at https://xervai.com/cloud. Curious about a specific Azure feature?`;
    } else if (msg.includes('office') || msg.includes('dubai') || msg.includes('nyc') || msg.includes('india')) {
      return `We’re a global crew, but for specific office details, drop a line to test01@gmail.com, and I’ll get our team to clarify. Where are you based?`;
    } else if (msg.includes('call') || msg.includes('sales') || msg.includes('schedule')) {
      const dateMatch = msg.match(/(\d{1,2}-\w{3,4}|\d{4})\s*(at)*\s*(\d{1,2}(:\d{2})?\s*(am|pm)?\s*(cet|est|pst|ist)?)/i);
      if (dateMatch) {
        sendMessage(message, `Got it! I’ve noted your request for a sales call on ${dateMatch[0]}. Our team will confirm via test01@gmail.com. Anything else I can help with?`);
        return;
      }
      return `Want a sales call? Tell me when (e.g., "24-Jun at 5pm CET"), and I’ll pass it to our team via test01@gmail.com.`;
    } else if (msg.includes('girl') || msg.includes('boy')) {
      return `Ha, I’m a charming AI with no gender—just pure tech savvy and a dash of wit. What’s next on your list?`;
    } else if (msg.includes('stupid') || msg.includes('leaving')) {
      return `Ouch, that stings! But I’m here to win you back with top-notch answers. Tell me what you need, and I’ll dazzle you. What’s up?`;
    } else {
      const matchedService = services.find(s => msg.includes(s.name.toLowerCase()));
      if (matchedService) {
        return `${matchedService.name}: ${matchedService.desc} Dive deeper at ${matchedService.url}. Want more info?`;
      }
      return `Hmm, you’ve got me thinking! For specifics on our services or anything else, check https://xervai.com/services or ask me about AI, Cloud, or contact details. What’s your next move?`;
    }
  };

  chatbotIcon.addEventListener('click', () => {
    const isOpen = chatbotBody.style.display === 'block';
    chatbotBody.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      sendMessage('', 'Welcome to Xerv-Ai! I’m your sharp, tech-savvy assistant. Ask about our services, Azure, or how to reach us!');
    }
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
      const userMessage = chatInput.value.trim();
      chatInput.value = '';
      const botResponse = handleQuery(userMessage);
      if (botResponse) {
        sendMessage(userMessage, botResponse);
      }
    }
  });
});
