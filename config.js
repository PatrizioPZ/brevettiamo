// config.js — Configurazione API BrevettIAmo
// ⚠️ NON COMMITTARE MAI SU GITHUB! Aggiungi a .gitignore

const CONFIG = {
    // Inserisci qui la tua chiave API Groq (senza virgolette interne)
    GROQ_API_KEY: '
      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  ',
    
    // Endpoint Groq (compatibile OpenAI)
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    
    // Modelli disponibili
    MODELLI: {
        testo: 'llama-3.1-70b-versatile',      // Analisi testuali complesse
        visione: 'llava-v1.5-7b-4096-preview', // Analisi immagini/disegni
        rapido: 'mixtral-8x7b-32768',           // Task veloci
        bilanciato: 'llama-3.1-8b-instant'      // Buon compromesso velocita/qualita
    },
    
    // Parametri default
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS: 4000,
    
    // Timeout e retry
    TIMEOUT_MS: 30000,
    MAX_RETRY: 2
};

// Esporta per moduli (se usi import) o globale
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
