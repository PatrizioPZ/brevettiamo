// ============================================================
// BREVETTIAMO - Smart Router IA
// Gestisce cascata modelli, fair share, batch notturno
// Budget: 0€ (beta) - 25€/mese (post-beta)
// ============================================================

class IARouter {
  constructor(config) {
    this.config = config;
    this.modelli = config.occhio.router.modelli;
    this.fairShare = config.occhio.fair_share;
    this.cache = new Map(); // Cache risultati
    this.queue = []; // Coda batch
    
    this.init();
  }
  
  init() {
    // Avvia batch notturno se configurato
    if (this.fairShare.overflow_batch) {
      this.scheduleBatch();
    }
  }
  
  // --- CHIAMATA PRINCIPALE ---
  async chiamaIA(task, dati, opzioni = {}) {
    const utenteId = opzioni.utenteId || 'anonimo';
    const priorita = opzioni.priorita || 'normale';
    
    // 1. Controlla cache
    const cacheKey = this.generaCacheKey(task, dati);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 2. Controlla fair share
    if (!this.haQuotaDisponibile(utenteId)) {
      // Accoda per batch notturno
      this.accodaBatch(task, dati, utenteId, opzioni);
      return {
        stato: 'in_coda',
        messaggio: 'Tanti utenti attivi! La tua analisi sara pronta entro le 6:00.',
        eta: '6:00 AM'
      };
    }
    
    // 3. Scegli modello
    const modello = this.scegliModello(task, priorita);
    
    // 4. Esegui chiamata
    try {
      const risultato = await this.eseguiChiamata(modello, task, dati);
      
      // 5. Salva in cache
      this.cache.set(cacheKey, risultato);
      
      // 6. Consuma quota
      this.consumaQuota(utenteId);
      
      return risultato;
      
    } catch (errore) {
      // Fallback al modello successivo
      return this.fallbackModello(task, dati, modello, errore);
    }
  }
  
  // --- SCELTA MODELLO ---
  scegliModello(task, priorita) {
    const regole = this.config.occhio.router.regole;
    
    // Mappa task → modello
    if (task.includes('immagine') || task.includes('visione')) {
      return this.modelli.clip_free;
    }
    
    if (task.includes('geometrico') || task.includes('svg')) {
      return this.modelli.opencv_free || this.modelli.mistral_7b_free;
    }
    
    if (priorita === 'urgente') {
      return this.modelli.gemma_7b_free || this.modelli.mistral_7b_free;
    }
    
    // Default
    return this.modelli.mistral_7b_free;
  }
  
  // --- ESECUZIONE CHIAMATA ---
  async eseguiChiamata(modello, task, dati) {
    const endpoint = modello.endpoint;
    const provider = modello.provider;
    
    if (provider === 'openrouter') {
      return this.chiamaOpenRouter(endpoint, task, dati);
    }
    
    if (provider === 'huggingface') {
      return this.chiamaHuggingFace(endpoint, task, dati);
    }
    
    // Fallback locale
    return this.chiamaLocale(task, dati);
  }
  
  async chiamaOpenRouter(endpoint, task, dati) {
    // In produzione: fetch reale a OpenRouter
    // Per demo: simulazione
    
    const prompt = this.generaPrompt(task, dati);
    
    // Simula latenza rete
    await this.sleep(500 + Math.random() * 1500);
    
    // Simula risposta
    return {
      stato: 'completato',
      modello: endpoint,
      risultato: this.simulaRisposta(task, dati),
      tokens_usati: Math.floor(Math.random() * 500) + 100,
      tempo_ms: 1200
    };
  }
  
  async chiamaHuggingFace(endpoint, task, dati) {
    // Simulazione per CLIP/visione
    await this.sleep(800 + Math.random() * 1000);
    
    return {
      stato: 'completato',
      modello: endpoint,
      risultato: this.simulaRispostaVisione(task, dati),
      tempo_ms: 1500
    };
  }
  
  chiamaLocale(task, dati) {
    // Per task semplici, senza chiamata API
    return {
      stato: 'completato',
      modello: 'locale',
      risultato: this.simulaRisposta(task, dati),
      tempo_ms: 50
    };
  }
  
  // --- FALLBACK ---
  async fallbackModello(task, dati, modelloFallito, errore) {
    console.warn(`Modello ${modelloFallito.id} fallito, provo fallback`);
    
    // Prova modello successivo nella cascata
    const modelli = Object.values(this.modelli);
    const indice = modelli.findIndex(m => m.id === modelloFallito.id);
    
    if (indice < modelli.length - 1) {
      const nextModello = modelli[indice + 1];
      return this.eseguiChiamata(nextModello, task, dati);
    }
    
    // Tutti i modelli falliti
    return {
      stato: 'errore',
      messaggio: 'Servizio temporaneamente non disponibile. Riprova tra qualche minuto.',
      errore: errore.message
    };
  }
  
  // --- FAIR SHARE ---
  haQuotaDisponibile(utenteId) {
    // In produzione: controlla da Supabase/DB
    // Per demo: sempre true (gestito dal server)
    return true;
  }
  
  consumaQuota(utenteId) {
    // In produzione: aggiorna DB
    console.log(`Quota consumata per utente ${utenteId}`);
  }
  
  // --- BATCH NOTTURNO ---
  accodaBatch(task, dati, utenteId, opzioni) {
    this.queue.push({
      task,
      dati,
      utenteId,
      opzioni,
      timestamp: Date.now()
    });
    
    console.log(`Task accodato per batch. Coda: ${this.queue.length}`);
  }
  
  scheduleBatch() {
    // Controlla ogni ora se è ora del batch (2:00-6:00)
    setInterval(() => {
      const ora = new Date().getHours();
      if (ora >= 2 && ora < 6 && this.queue.length > 0) {
        this.processaBatch();
      }
    }, 3600000); // Ogni ora
  }
  
  async processaBatch() {
    console.log(`Processo batch: ${this.queue.length} task`);
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        const risultato = await this.chiamaIA(item.task, item.dati, {
          ...item.opzioni,
          priorita: 'batch'
        });
        
        // Notifica utente (email/push)
        this.notificaUtente(item.utenteId, risultato);
        
      } catch (errore) {
        console.error('Errore batch:', errore);
      }
      
      // Delay tra chiamate per non sovraccaricare
      await this.sleep(2000);
    }
  }
  
  notificaUtente(utenteId, risultato) {
    // In produzione: invia email/push
    console.log(`Notifica inviata a ${utenteId}`);
  }
  
  // --- CACHE ---
  generaCacheKey(task, dati) {
    // Hash semplice per cache
    const str = JSON.stringify({ task, dati });
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
  
  // --- PROMPT ---
  generaPrompt(task, dati) {
    const prompts = {
      'ricerca_brevetti': `Analizza il seguente testo e cerca prior art simili: ${dati}`,
      'redazione_rivendicazioni': `Ottimizza le seguenti rivendicazioni per massima protezione: ${dati}`,
      'verifica_novita': `Verifica la novita di questa invenzione rispetto allo stato dell'arte: ${dati}`,
      'traduzione_tecnica': `Traduci il seguente testo tecnico mantenendo terminologia brevettuale: ${dati}`,
      'allert_ia': `Analizza questa inserzione e determina se viola il brevetto: ${dati}`,
      'dogane_ue': `Analizza questo documento di sequestro doganale: ${dati}`
    };
    
    return prompts[task] || `Analizza: ${dati}`;
  }
  
  // --- SIMULAZIONE RISPOSTE (per demo) ---
  simulaRisposta(task, dati) {
    const risposte = {
      'ricerca_brevetti': {
        trovati: 3,
        similarita: 65,
        risultati: [
          { titolo: 'Brevetto simile #1', similarita: 72, numero: 'EP1234567' },
          { titolo: 'Brevetto simile #2', similarita: 58, numero: 'US9876543' },
          { titolo: 'Brevetto simile #3', similarita: 45, numero: 'CN4567890' }
        ],
        consiglio: 'La tua invenzione ha elementi di novita rispetto alla prior art trovata.'
      },
      'redazione_rivendicazioni': {
        rivendicazioni_ottimizzate: 12,
        copertura: '85%',
        note: 'Rivendicazioni ottimizzate per evitare sovrattasse EPO (max 15)'
      },
      'verifica_novita': {
        novita: 78,
        stato_arte: 'Moderato',
        rischio: 'Basso',
        note: 'L\'invenzione presenta elementi di novita significativi'
      },
      'traduzione_tecnica': {
        lingua_target: 'en',
        qualita: 92,
        testo_tradotto: 'Traduzione completata con terminologia brevettuale corretta'
      },
      'allert_ia': {
        infrazione: false,
        confidenza: 23,
        note: 'Nessuna corrispondenza significativa rilevata'
      },
      'dogane_ue': {
        sequestro: false,
        documento: 'Analizzato',
        note: 'Nessun sequestro rilevante per il tuo brevetto'
      }
    };
    
    return risposte[task] || { risultato: 'Analisi completata', dati: dati };
  }
  
  simulaRispostaVisione(task, dati) {
    return {
      immagini_analizzate: 1,
      similarita_visiva: 34,
      corrispondenza_geometrica: 28,
      note: 'Nessuna corrispondenza visiva significativa rilevata'
    };
  }
  
  // --- UTILITY ---
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // --- STATISTICHE ---
  getStatistiche() {
    return {
      cache_size: this.cache.size,
      queue_size: this.queue.length,
      modelli_disponibili: Object.keys(this.modelli).length,
      fair_share_attivo: this.fairShare.attivo
    };
  }
}

// Esportazione
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IARouter;
}
