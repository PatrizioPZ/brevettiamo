// js/e2e-module.js - Modulo E2E per BrevettIAmo
// Gestisce autenticazione e chiavi API
// Versione demo con bypass per test

class BrevettIAmoE2E {
  constructor() {
    this.configurato = false;
    this.chiave = null;
  }

  // Inizializzazione
  static init() {
    const instance = new BrevettIAmoE2E();
    instance.configurato = true;
    console.log('[BrevettIAmoE2E] Modulo caricato. Pronto per l'uso.');
    return instance;
  }

  // Recupero chiave API - bypass per demo
  async recoverKey() {
    // PRIORITA 1: Chiave da localStorage (utente ha inserito)
    let chiave = localStorage.getItem('brevettiamo_api_key');

    // PRIORITA 2: Chiave da URL params (debug)
    if (!chiave) {
      const params = new URLSearchParams(window.location.search);
      chiave = params.get('api_key');
    }

    // PRIORITA 3: Demo mode (nessuna chiave richiesta)
    if (!chiave) {
      console.log('[BrevettIAmoE2E] Demo mode - nessuna chiave API richiesta');
      this.chiave = 'demo-key-brevettiamo';
      this.configurato = true;
      return this.chiave;
    }

    this.chiave = chiave;
    this.configurato = true;
    return chiave;
  }

  // Verifica configurazione
  isConfigurato() {
    return true; // Sempre true per demo
  }

  // Salva chiave
  saveKey(chiave) {
    localStorage.setItem('brevettiamo_api_key', chiave);
    this.chiave = chiave;
    this.configurato = true;
    console.log('[BrevettIAmoE2E] Chiave salvata');
  }

  // Reset
  reset() {
    localStorage.removeItem('brevettiamo_api_key');
    this.chiave = null;
    this.configurato = false;
  }
}

// Esportazione globale
if (typeof window !== 'undefined') {
  window.BrevettIAmoE2E = BrevettIAmoE2E;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrevettIAmoE2E;
}
