// ============================================
// CHATBOT.JS - BREVVETTIAMO (OPENROUTER via BACKEND)
// ============================================

class Chatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.backendUrl = 'https://brevettiamo-backend.onrender.com';
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.attachEventListeners();
    this.loadChatHistory();
  }

  createChatbotHTML() {
    const chatbotHTML = `
      <div id="chatbot-container" class="chatbot-container">
        <div class="chatbot-header">
          <span class="chatbot-title">Assistente BrevettIAmo</span>
          <button id="chatbot-close" class="chatbot-close">&times;</button>
        </div>
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chatbot-message bot-message">
            <div class="message-content">
              Ciao! Sono l'assistente AI di BrevettIAmo. Come posso aiutarti con i tuoi brevetti o la piattaforma?
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
          </div>
        </div>
        <div class="chatbot-input-area">
          <div id="chatbot-typing" class="chatbot-typing hidden">
            <span></span><span></span><span></span>
          </div>
          <div class="chatbot-input-wrapper">
            <input type="text" id="chatbot-input" placeholder="Scrivi un messaggio..." maxlength="500">
            <button id="chatbot-send" class="chatbot-send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <button id="chatbot-toggle" class="chatbot-toggle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;

    const div = document.createElement('div');
    div.innerHTML = chatbotHTML;
    document.body.appendChild(div);
  }

  attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.toggleChat());
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    const container = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      container.classList.add('open');
      toggle.classList.add('hidden');
      document.getElementById('chatbot-input').focus();
    } else {
      container.classList.remove('open');
      toggle.classList.remove('hidden');
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';
    this.showTyping(true);

    try {
      const response = await fetch(this.backendUrl + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: this.messages.slice(-10)
        })
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const data = await response.json();
      this.addMessage(data.reply, 'bot');
      this.saveChatHistory();

    } catch (error) {
      console.error('Chatbot error:', error);
      this.addMessage(
        'Mi dispiace, sto avendo problemi di connessione. Riprova tra qualche istante o contatta il supporto.',
        'bot'
      );
    } finally {
      this.showTyping(false);
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message ' + sender + '-message';
    
    const formattedText = this.formatMessage(text);
    
    messageDiv.innerHTML = `
      <div class="message-content">${formattedText}</div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    this.messages.push({ role: sender, text: text, time: new Date().toISOString() });
  }

  formatMessage(text) {
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  showTyping(show) {
    const typing = document.getElementById('chatbot-typing');
    if (show) {
      typing.classList.remove('hidden');
    } else {
      typing.classList.add('hidden');
    }
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  saveChatHistory() {
    const recentMessages = this.messages.slice(-20);
    localStorage.setItem('brevettiamo_chat_history', JSON.stringify(recentMessages));
  }

  loadChatHistory() {
    const saved = localStorage.getItem('brevettiamo_chat_history');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        this.messages = history;
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.brevettiamoChatbot = new Chatbot();
});
