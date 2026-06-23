// config.js - Configurazione sicura BrevettIAmo
// ATTENZIONE: Non committare mai API key reali in questo file!

const CONFIG = {
  // API Key Groq - caricata da localStorage (inserita dall'utente nel browser)
  GROQ_API_KEY: localStorage.getItem('groq_api_key') || '',
  
  // Endpoint Groq (compatibile OpenAI)
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  
  // API Key OpenRouter - caricata da localStorage
  OPENROUTER_KEY: localStorage.getItem('openrouter_api_key') || '',
  
  // Endpoint OpenRouter
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions'
};

// Funzione per salvare API Key Groq in modo sicuro
function salvaGroqKey(key) {
  if (!key || key.indexOf('gsk_') !== 0) {
    console.error('Key Groq non valida (deve iniziare con gsk_)');
    return false;
  }
  localStorage.setItem('groq_api_key', key);
  CONFIG.GROQ_API_KEY = key;
  console.log('API Key Groq salvata in modo sicuro');
  return true;
}

// Funzione per rimuovere API Key Groq
function rimuoviGroqKey() {
  localStorage.removeItem('groq_api_key');
  CONFIG.GROQ_API_KEY = '';
  console.log('API Key Groq rimossa');
}

// Funzione per salvare API Key OpenRouter in modo sicuro
function salvaOpenRouterKey(key) {
  if (!key || key.indexOf('sk-or') !== 0) {
    console.error('Key OpenRouter non valida (deve iniziare con sk-or)');
    return false;
  }
  localStorage.setItem('openrouter_api_key', key);
  CONFIG.OPENROUTER_KEY = key;
  console.log('API Key OpenRouter salvata in modo sicuro');
  return true;
}

// Funzione per rimuovere API Key OpenRouter
function rimuoviOpenRouterKey() {
  localStorage.removeItem('openrouter_api_key');
  CONFIG.OPENROUTER_KEY = '';
  console.log('API Key OpenRouter rimossa');
}

// Inizializzazione
console.log('Configurazione caricata - API Key da localStorage');
