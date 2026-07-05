// js/ia-engine.js - Motore IA per BrevettIAmo
// Usa Groq API per analisi e generazione
// Versione demo con risposte simulate

class IAEngine {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || localStorage.getItem('brevettiamo_api_key') || 'demo-key',
      model: config.model || 'llama-3.1-70b-versatile',
      baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1',
      ...config
    };
    this.inizializzato = true;
  }

  // Metodo statico per verifica configurazione
  static isConfigurato() {
    return true; // Sempre true per demo
  }

  // Metodo di istanza per verifica
  isConfigurato() {
    return true; // Sempre true per demo
  }

  // Inizializzazione
  static init(config = {}) {
    return new IAEngine(config);
  }

  // Elaborazione principale
  async elabora(descrizione, servizio = 'servizio-deposito') {
    console.log('[IAEngine] Elaborazione in corso per:', servizio);
    console.log('[IAEngine] Descrizione:', descrizione);

    // Simulazione delay per realismo
    await this.delay(2000);

    // Risposta demo basata sul servizio
    const risposta = this.generaRispostaDemo(descrizione, servizio);

    return {
      success: true,
      data: risposta,
      servizio: servizio,
      timestamp: new Date().toISOString()
    };
  }

  // Genera risposta demo realistica
  generaRispostaDemo(descrizione, servizio) {
    const titolo = this.estraiTitolo(descrizione);

    switch(servizio) {
      case 'servizio-deposito':
        return this.generaDepositoDemo(titolo, descrizione);
      case 'servizio-prior-art':
        return this.generaPriorArtDemo(titolo);
      case 'servizio-rivendicazioni':
        return this.generaRivendicazioniDemo(titolo);
      case 'servizio-tavole':
        return this.generaTavoleDemo(titolo);
      case 'servizio-cad':
        return this.generaCADDemo(titolo);
      default:
        return this.generaDepositoDemo(titolo, descrizione);
    }
  }

  generaDepositoDemo(titolo, descrizione) {
    return {
      tipo: 'deposito-brevetto',
      titolo: titolo,
      riassunto: `Invenzione: ${descrizione.substring(0, 100)}...`,
      classificazione: 'A47C 1/00 (sedie e poltrone)',
      novita: 'Alta',
      livello_inventivo: 'Medio-Alto',
      industrialita: 'Si',
      documenti: [
        {
          nome: 'Descrizione Tecnica',
          contenuto: `DESCRIZIONE TECNICA\n\nTitolo: ${titolo}\n\n1. Campo tecnico\nL'invenzione si riferisce al campo delle sedute, in particolare a una sedia con sistema di ventilazione integrato.\n\n2. Descrizione dello stato dell'arte\nLe sedie tradizionali non prevedono sistemi di ventilazione...\n\n3. Descrizione dell'invenzione\n${descrizione}\n\n4. Vantaggi\n- Comfort termico migliorato\n- Riduzione sudorazione\n- Basso consumo energetico\n- Facile manutenzione`,
          formato: 'txt'
        },
        {
          nome: 'Rivendicazioni',
          contenuto: `RIVENDICAZIONI\n\n1. Sedia caratterizzata da un sistema di ventilazione (2) integrato nello schienale (1), comprendente almeno una ventola (3) e un condotto d'aria (4).\n\n2. Sedia secondo la rivendicazione 1, in cui detta ventola (3) e' a velocita' variabile.\n\n3. Sedia secondo una qualsiasi delle rivendicazioni precedenti, in cui detto condotto d'aria (4) presenta aperture (5) orientabili.`,
          formato: 'txt'
        },
        {
          nome: 'Tavola Figura 1',
          contenuto: 'SVG_TAVOLA_1',
          formato: 'svg',
          tipo: 'assieme'
        }
      ],
      prezzo_stimato: 299,
      tempo_stimato: '24 ore'
    };
  }

  generaPriorArtDemo(titolo) {
    return {
      tipo: 'prior-art',
      titolo: titolo,
      risultati: [
        { fonte: 'USPTO', rilevanza: 'Bassa', titolo: 'Sedia ergonomica', numero: 'US1234567' },
        { fonte: 'EPO', rilevanza: 'Media', titolo: 'Sedia con ventilazione', numero: 'EP9876543' },
        { fonte: 'WIPO', rilevanza: 'Bassa', titolo: 'Sistema di raffreddamento', numero: 'WO4567890' }
      ],
      analisi: 'Novita confermata - nessun documento rilevante trovato',
      conferma: true
    };
  }

  generaRivendicazioniDemo(titolo) {
    return {
      tipo: 'rivendicazioni',
      titolo: titolo,
      rivendicazioni: [
        '1. Sedia con sistema di ventilazione integrato nello schienale.',
        '2. Sedia secondo riv. 1, dove la ventola e a velocita variabile.',
        '3. Sedia secondo riv. 1 o 2, dove le aperture sono orientabili.'
      ],
      formato: 'UIBM'
    };
  }

  generaTavoleDemo(titolo) {
    return {
      tipo: 'tavole',
      titolo: titolo,
      tavole: [
        { tipo: 'assieme', numero: 1, descrizione: 'Vista d\'assieme' },
        { tipo: 'esplosa', numero: 2, descrizione: 'Vista esplosa' },
        { tipo: 'sezione', numero: 3, descrizione: 'Sezione A-A' },
        { tipo: 'dettaglio', numero: 4, descrizione: 'Dettaglio X' }
      ]
    };
  }

  generaCADDemo(titolo) {
    return {
      tipo: 'cad',
      titolo: titolo,
      file: 'sedia_ventola_v1.step',
      dimensioni: { x: 450, y: 500, z: 1200 },
      unita: 'mm'
    };
  }

  estraiTitolo(descrizione) {
    const parole = descrizione.split(' ').slice(0, 5);
    return parole.join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility per chiamate API reali (quando configurate)
  async chiamaAPI(messages) {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[IAEngine] API non disponibile, uso demo:', error.message);
      return null;
    }
  }
}

// Esportazione globale
if (typeof window !== 'undefined') {
  window.IAEngine = IAEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IAEngine;
}
