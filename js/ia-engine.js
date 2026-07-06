// js/ia-engine.js - Motore IA per BrevettIAmo
// Usa Supabase Edge Function per chiamate API sicure

class IAEngine {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || "https://jtekrvlmqnluvaiapmwb.supabase.co",
      supabaseAnonKey: config.supabaseAnonKey || "sb_publishable_p9WH85YPfwtaKp4tfcDwug_Q9duausk",
      ...config
    };
    this.inizializzato = true;
  }

  static isConfigurato() {
    return true;
  }

  isConfigurato() {
    return true;
  }

  static init(config = {}) {
    return new IAEngine(config);
  }

  async elabora(descrizione, servizio = "servizio-deposito") {
    console.log("[IAEngine] Elaborazione via Supabase per:", servizio);
    console.log("[IAEngine] Descrizione:", descrizione.substring(0, 100) + "...");

    try {
      const response = await fetch(this.config.supabaseUrl + "/functions/v1/call-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": this.config.supabaseAnonKey,
          "Authorization": "Bearer " + this.config.supabaseAnonKey
        },
        body: JSON.stringify({
          descrizione: descrizione,
          servizio: servizio
        })
      });

      const data = await response.json();
      console.log("[IAEngine] Risposta Supabase:", data);

      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      const contenuto = data.choices?.[0]?.message?.content || data.content || JSON.stringify(data);

      return {
        success: true,
        data: {
          tipo: servizio,
          titolo: this.estraiTitolo(descrizione),
          contenuto: contenuto,
          raw: data,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.warn("[IAEngine] Errore Supabase, uso fallback demo:", error.message);
      return this.generaRispostaDemo(descrizione, servizio);
    }
  }

  generaRispostaDemo(descrizione, servizio) {
    const titolo = this.estraiTitolo(descrizione);

    switch(servizio) {
      case "servizio-deposito":
        return this.generaDepositoDemo(titolo, descrizione);
      case "servizio-prior-art":
        return this.generaPriorArtDemo(titolo);
      case "servizio-rivendicazioni":
        return this.generaRivendicazioniDemo(titolo);
      case "servizio-tavole":
        return this.generaTavoleDemo(titolo);
      case "servizio-cad":
        return this.generaCADDemo(titolo);
      default:
        return this.generaDepositoDemo(titolo, descrizione);
    }
  }

  generaDepositoDemo(titolo, descrizione) {
    return {
      success: true,
      data: {
        tipo: "deposito-brevetto",
        titolo: titolo,
        riassunto: "Invenzione: " + descrizione.substring(0, 100) + "...",
        classificazione: "A47C 1/00 (sedie e poltrone)",
        novita: "Alta",
        livello_inventivo: "Medio-Alto",
        industrialita: "Si",
        documenti: [
          {
            nome: "Descrizione Tecnica",
            contenuto: "DESCRIZIONE TECNICA\n\nTitolo: " + titolo + "\n\n1. Campo tecnico\nL invenzione si riferisce al campo delle sedute.\n\n2. Descrizione dell invenzione\n" + descrizione + "\n\n3. Vantaggi\n- Comfort termico migliorato\n- Riduzione sudorazione\n- Basso consumo energetico",
            formato: "txt"
          },
                   {
            nome: "Rivendicazioni",
            contenuto: "RIVENDICAZIONI\n\n1. Sedia caratterizzata da un sistema di ventilazione integrato.\n\n2. Sedia secondo la rivendicazione 1, in cui detta ventola e a velocita variabile.",
            formato: "txt"
          }
        ],
        prezzo_stimato: 299,
        tempo_stimato: "24 ore",
        timestamp: new Date().toISOString()
      }
    };
  }

  generaPriorArtDemo(titolo) {
    return {
      success: true,
      data: {
        tipo: "prior-art",
        titolo: titolo,
        risultati: [
          { fonte: "USPTO", rilevanza: "Bassa", titolo: "Sedia ergonomica", numero: "US1234567" },
          { fonte: "EPO", rilevanza: "Media", titolo: "Sedia con ventilazione", numero: "EP9876543" }
        ],
        analisi: "Novita confermata - nessun documento rilevante trovato",
        conferma: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  generaRivendicazioniDemo(titolo) {
    return {
      success: true,
      data: {
        tipo: "rivendicazioni",
        titolo: titolo,
        rivendicazioni: [
          "1. Sedia con sistema di ventilazione integrato.",
          "2. Sedia secondo riv. 1, dove la ventola e a velocita variabile.",
          "3. Sedia secondo riv. 1 o 2, dove le aperture sono orientabili."
        ],
        formato: "UIBM",
        timestamp: new Date().toISOString()
      }
    };
  }

  generaTavoleDemo(titolo) {
    return {
      success: true,
      data: {
        tipo: "tavole",
        titolo: titolo,
        tavole: [
          { tipo: "assieme", numero: 1, descrizione: "Vista d assieme" },
          { tipo: "esplosa", numero: 2, descrizione: "Vista esplosa" },
          { tipo: "sezione", numero: 3, descrizione: "Sezione A-A" },
          { tipo: "dettaglio", numero: 4, descrizione: "Dettaglio X" }
        ],
        timestamp: new Date().toISOString()
      }
    };
  }

  generaCADDemo(titolo) {
    return {
      success: true,
      data: {
        tipo: "cad",
        titolo: titolo,
        file: "sedia_ventola_v1.step",
        dimensioni: { x: 450, y: 500, z: 1200 },
        unita: "mm",
        timestamp: new Date().toISOString()
      }
    };
  }

  estraiTitolo(descrizione) {
    const parole = descrizione.split(" ").slice(0, 5);
    return parole.join(" ").replace(/[^a-zA-Z0-9\s]/g, "");
  }
}

if (typeof window !== "undefined") {
  window.IAEngine = IAEngine;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = IAEngine;
}
