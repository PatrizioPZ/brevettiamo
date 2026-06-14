// ============================================================
// BREVETTIAMO - L'OCCHIO ENGINE v3.0
// Configurazione Centralizzata - Tutti i servizi usano L'OCCHIO
// Budget IA: 0€ (beta) - 25€/mese (post-beta)
// Zero P.IVA necessaria, zero spese fisse, scala a zero
// ============================================================

const BREVETTIAMO = {
  versione: "3.0",
  nome: "BrevettIAmo - L'OCCHIO",
  stato: "beta",
  
  // ============================================================
  // L'OCCHIO ENGINE - Tecnologia Base di Tutta la Piattaforma
  // ============================================================
  occhio: {
    // --- Analisi Multi-Modale ---
    analisi: {
      testo: {
        id: "analisi_testo",
        descrizione: "NLP, rivendicazioni, descrizioni, abstract",
        modelli: ["mistral_7b_free", "llama3_8b_free", "gemma_7b_free"],
        strategia: "cascata",
        usato_da: [
          "ricerca_brevetti", "redazione_rivendicazioni", "verifica_novita",
          "traduzione_tecnica", "ebay_vero", "allert_ia", "dogane_ue"
        ]
      },
      immagini: {
        id: "analisi_immagini",
        descrizione: "Vision AI, foto, render, tavole tecniche",
        modelli: ["clip_free", "llama_vision_free"],
        strategia: "cascata",
        usato_da: [
          "ricerca_brevetti", "valutazione_tecnica", "aliexpress_p2p",
          "dogane_ue", "allert_ia", "google_images", "bing_visual"
        ]
      },
      geometrico: {
        id: "analisi_geometrica",
        descrizione: "Confronto vettoriale SVG, angoli, strutture",
        modelli: ["opencv_free"],
        strategia: "on_demand",
        usato_da: [
          "valutazione_tecnica", "aliexpress_p2p", "dogane_ue", "allert_ia"
        ]
      },
      video: {
        id: "analisi_video",
        descrizione: "Frame extraction, analisi immagini su video",
        modelli: ["clip_free"],
        strategia: "batch_notturno",
        usato_da: ["tiktok_shop", "youtube", "allert_ia"]
      }
    },
    
    // --- Smart Router IA ---
    router: {
      budget_mese_euro: 0,
      strategia: "cascata_intelligente",
      
      modelli: {
        mistral_7b_free: {
          id: "mistral_7b_free",
          nome: "Mistral 7B",
          provider: "openrouter",
          endpoint: "mistralai/mistral-7b-instruct:free",
          costo: 0,
          qualita: 7,
          limite_giorno: 200
        },
        llama3_8b_free: {
          id: "llama3_8b_free",
          nome: "Llama 3 8B",
          provider: "openrouter",
          endpoint: "meta-llama/llama-3-8b-instruct:free",
          costo: 0,
          qualita: 7.5,
          limite_giorno: 200
        },
        gemma_7b_free: {
          id: "gemma_7b_free",
          nome: "Gemma 7B",
          provider: "openrouter",
          endpoint: "google/gemma-7b-it:free",
          costo: 0,
          qualita: 7,
          limite_giorno: 200
        },
        clip_free: {
          id: "clip_free",
          nome: "CLIP",
          provider: "huggingface",
          endpoint: "openai/clip-vit-base-patch32",
          costo: 0,
          qualita: 6,
          limite_giorno: "illimitati"
        },
        llama_vision_free: {
          id: "llama_vision_free",
          nome: "Llama Vision",
          provider: "openrouter",
          endpoint: "meta-llama/llama-3.2-11b-vision-instruct:free",
          costo: 0,
          qualita: 7.5,
          limite_giorno: 200
        }
      },
      
      regole: {
        default: "mistral_7b_free",
        se_risultato_insufficiente: "llama3_8b_free",
        se_urgente: "gemma_7b_free",
        se_immagini: "clip_free",
        se_immagini_complesse: "llama_vision_free"
      },
      
      limiti_per_pacchetto: {
        starter: { premium: 0, cheap: 0, free: "illimitati" },
        pro: { premium: 0, cheap: 0, free: "illimitati" },
        enterprise: { premium: 0, cheap: 0, free: "illimitati" }
      }
    },
    
    // --- Fair Share (Beta) ---
    fair_share: {
      attivo: true,
      limite_giornaliero_totale: 200,
      calcolo: "200 / utenti_attivi_oggi",
      min_per_utente: 1,
      max_per_utente: 10,
      overflow_batch: true,
      orario_batch: "02:00-06:00"
    },
    
    // --- Canali di Sorveglianza ---
    canali: {
      amazon: {
        id: "amazon", nome: "Amazon Marketplace",
        categorie: ["marketplace", "ecommerce"],
        url: "amazon.com|amazon.it|amazon.de|amazon.fr|amazon.co.uk|amazon.es",
        analisi_richieste: ["testo", "immagini"],
        api: "brand_registry", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_brand_registry" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      ebay: {
        id: "ebay", nome: "eBay Global",
        categorie: ["marketplace", "auction"],
        url: "ebay.com|ebay.it|ebay.de|ebay.fr|ebay.co.uk",
        analisi_richieste: ["testo", "immagini"],
        api: "vero_api", scraping: true,
        azione_auto: { soglia: 95, tipo: "takedown_vero" },
        usato_da: ["allert_ia", "anti_contraffazione", "ebay_vero"]
      },
      aliexpress: {
        id: "aliexpress", nome: "AliExpress",
        categorie: ["marketplace", "b2c"],
        analisi_richieste: ["immagini", "geometrico"],
        api: null, scraping: "p2p",
        azione_auto: { soglia: 95, tipo: "diffida_ipp" },
        usato_da: ["allert_ia", "anti_contraffazione", "aliexpress_p2p"]
      },
      alibaba: {
        id: "alibaba", nome: "Alibaba B2B",
        categorie: ["wholesale", "b2b"],
        analisi_richieste: ["immagini", "geometrico"],
        api: null, scraping: "p2p",
        azione_auto: { soglia: 95, tipo: "diffida_ipp" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      temu: {
        id: "temu", nome: "Temu",
        categorie: ["marketplace", "discount"],
        analisi_richieste: ["immagini", "prezzo"],
        api: null, scraping: "p2p",
        azione_auto: { soglia: 95, tipo: "notifica_legal" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      etsy: {
        id: "etsy", nome: "Etsy",
        categorie: ["marketplace", "handmade"],
        analisi_richieste: ["testo", "immagini"],
        api: "etsy_api", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_ip" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      facebook_marketplace: {
        id: "facebook_mp", nome: "Facebook Marketplace",
        categorie: ["social", "marketplace"],
        analisi_richieste: ["testo", "immagini"],
        api: "facebook_graph", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_ip" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      instagram_shopping: {
        id: "instagram_shop", nome: "Instagram Shopping",
        categorie: ["social", "commerce"],
        analisi_richieste: ["immagini", "testo"],
        api: "instagram_graph", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_ip" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      tiktok_shop: {
        id: "tiktok_shop", nome: "TikTok Shop",
        categorie: ["social", "video"],
        analisi_richieste: ["video", "immagini"],
        api: null, scraping: "p2p",
        azione_auto: { soglia: 95, tipo: "notifica_legal" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      mercado_libre: {
        id: "mercado_libre", nome: "Mercado Libre",
        categorie: ["marketplace", "latam"],
        analisi_richieste: ["testo", "immagini"],
        api: "mercado_api", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_ip" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      rakuten: {
        id: "rakuten", nome: "Rakuten",
        categorie: ["marketplace", "asia"],
        analisi_richieste: ["testo", "immagini"],
        api: "rakuten_api", scraping: true,
        azione_auto: { soglia: 95, tipo: "report_ip" },
        usato_da: ["allert_ia", "anti_contraffazione"]
      },
      dogane_ue: {
        id: "dogane_ue", nome: "Dogane Europee - IPR Enforcement",
        categorie: ["dogane", "enforcement", "stato"],
        descrizione: "Monitoraggio sequestri merci contraffatte UE",
        analisi_richieste: ["documenti", "immagini_sequestro", "geometrico"],
        api: "ipr_portal", scraping: false,
        requisiti_legali: {
          procura_digitale: true,
          afa_automatica: true,
          rappresentanza: "BrevettIAmo",
          costo_stato: 0
        },
        flusso: {
          fase_1: "Firma procura digitale (SPID/CIE)",
          fase_2: "IA deposita AFA automaticamente",
          fase_3: "Intercettazione notifiche PEC",
          fase_4: "IA analizza PDF e foto sequestro",
          fase_5: "Allert utente in dashboard"
        },
        azione_auto: { soglia: 90, tipo: "notifica_pec_dashboard" },
        usato_da: ["monitoraggio_dogane", "allert_ia", "anti_contraffazione"]
      },
      google_images: {
        id: "google_images", nome: "Google Images",
        categorie: ["web", "search"],
        analisi_richieste: ["immagini", "reverse_image"],
        api: "google_custom_search", scraping: false,
        azione_auto: { soglia: 95, tipo: "log_sorveglianza" },
        usato_da: ["allert_ia", "ricerca_web", "ricerca_brevetti"]
      },
      bing_visual: {
        id: "bing_visual", nome: "Bing Visual Search",
        categorie: ["web", "search"],
        analisi_richieste: ["immagini", "reverse_image"],
        api: "bing_api", scraping: false,
        azione_auto: { soglia: 95, tipo: "log_sorveglianza" },
        usato_da: ["allert_ia", "ricerca_web", "ricerca_brevetti"]
      }
    },
    
    // --- Allert & Azione ---
    allert: {
      livelli: {
        info: { soglia: 0, colore: "grigio", azione: "log_silenzioso" },
        warning: { soglia: 70, colore: "giallo", azione: "notifica_dashboard" },
        critical: { soglia: 95, colore: "rosso", azione: "azione_automatica" }
      },
      notifiche: {
        dashboard: true,
        email: true,
        push: false,
        pec: true,
        whatsapp: false
      },
      report: {
        frequenza: "settimanale",
        formato: "pdf",
        contenuto: ["riepilogo_infrazioni", "azioni_intraprese", "stato_canali"]
      }
    }
  },
  
  // ============================================================
  // SERVIZI - Tutti usano L'OCCHIO
  // ============================================================
  servizi: {
    // --- SERVIZI OCCHIO - Nomi Accattivanti ---
    occhio_falco: {
      id: "occhio_falco",
      nome: "OCCHIO di Falco",
      sottotitolo: "Sorveglianza 24/7",
      descrizione: "Vigilanza continua su tutti i canali. Il Falco non dorme mai.",
      icona: "eye",
      categoria: "occhio",
      tipo: "abbonamento",
      prezzo: 9,
      periodo: "mese",
      occhio: {
        analisi: ["testo", "immagini", "geometrico", "video"],
        canali: "tutti",
        router: "cascata",
        azione_auto: true,
        sorveglianza: "continua"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { 
        starter: { canali: 3, ricerche_giorno: 10 },
        pro: { canali: 10, ricerche_giorno: 100 },
        enterprise: { canali: "tutti", ricerche_giorno: "illimitati" }
      },
      flusso: ["benvenuto_beta", "privacy_nda", "carica_brevetto", "dashboard_occhio"]
    },
    
    occhio_lince: {
      id: "occhio_lince",
      nome: "OCCHIO di Lince",
      sottotitolo: "Analisi Approfondita",
      descrizione: "Vede ogni dettaglio. Report completo sullo stato attuale del tuo brevetto.",
      icona: "search",
      categoria: "occhio",
      tipo: "una_tantum",
      prezzo: 20,
      periodo: "una_volta",
      occhio: {
        analisi: ["testo", "immagini", "geometrico"],
        canali: ["google_images", "bing_visual", "amazon", "ebay", "aliexpress"],
        router: "cascata",
        azione_auto: false,
        sorveglianza: "no"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 1, pro: 3, enterprise: "illimitati" },
      flusso: ["benvenuto_beta", "privacy_nda", "carica_brevetto", "report_lince"],
      output: "report_pdf"
    },
    
    occhio_aquila: {
      id: "occhio_aquila",
      nome: "OCCHIO di Aquila",
      sottotitolo: "Analisi + Sorveglianza",
      descrizione: "Vista panoramica: analisi completa + 1 mese di sorveglianza Falco inclusa.",
      icona: "binoculars",
      categoria: "occhio",
      tipo: "combo",
      prezzo: 29,
      periodo: "una_volta",
      occhio: {
        analisi: ["testo", "immagini", "geometrico", "video"],
        canali: "tutti",
        router: "cascata",
        azione_auto: true,
        sorveglianza: "1_mese"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 1, pro: 3, enterprise: "illimitati" },
      flusso: ["benvenuto_beta", "privacy_nda", "carica_brevetto", "report_aquila", "dashboard_occhio"],
      include: ["occhio_lince", "occhio_falco_1mese"]
    },
    
    occhio_giove: {
      id: "occhio_giove",
      nome: "OCCHIO di Giove",
      sottotitolo: "Onniveggente",
      descrizione: "Il pacchetto completo. Tutti i servizi, sorveglianza illimitata, priorità massima.",
      icona: "crown",
      categoria: "occhio",
      tipo: "premium",
      prezzo: 99,
      periodo: "mese",
      occhio: {
        analisi: ["testo", "immagini", "geometrico", "video"],
        canali: "tutti",
        router: "cascata",
        azione_auto: true,
        sorveglianza: "illimitata",
        priorità: "massima"
      },
      pacchetti: { enterprise: true },
      limiti: { enterprise: "illimitati" },
      flusso: ["benvenuto_beta", "privacy_nda", "carica_brevetto", "dashboard_occhio"],
      include: "tutti"
    },
    
    // --- Vecchi servizi (mantenuti per compatibilità) ---
    ricerca_brevetti: {
      id: "ricerca_brevetti",
      nome: "Ricerca Brevetti",
      descrizione: "Ricerca prior art globale",
      icona: "search",
      categoria: "pipeline_idea",
      occhio: {
        analisi: ["testo", "immagini"],
        canali: ["google_images", "bing_visual", "epo_espacenet"],
        router: "default"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 5, pro: 20, enterprise: "illimitati" }
    },
    redazione_rivendicazioni: {
      id: "redazione_rivendicazioni",
      nome: "Redazione Rivendicazioni",
      descrizione: "Ottimizza testo per massima protezione",
      icona: "edit",
      categoria: "pipeline_idea",
      occhio: {
        analisi: ["testo"],
        router: "cascata"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 3, pro: 10, enterprise: "illimitati" }
    },
    verifica_novita: {
      id: "verifica_novita",
      nome: "Verifica Novita",
      descrizione: "Confronto con stato dell'arte",
      icona: "check",
      categoria: "pipeline_idea",
      occhio: {
        analisi: ["testo", "immagini", "geometrico"],
        canali: ["google_images", "bing_visual", "epo_espacenet", "uspto"],
        router: "default"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 3, pro: 15, enterprise: "illimitati" }
    },
    valutazione_tecnica: {
      id: "valutazione_tecnica",
      nome: "Valutazione Tecnica",
      descrizione: "Analisi disegni e tavole tecniche",
      icona: "ruler",
      categoria: "pipeline_idea",
      occhio: {
        analisi: ["immagini", "geometrico"],
        router: "immagini"
      },
      pacchetti: { starter: false, pro: true, enterprise: true },
      limiti: { starter: 0, pro: 10, enterprise: "illimitati" }
    },
    traduzione_tecnica: {
      id: "traduzione_tecnica",
      nome: "Traduzione Tecnica",
      descrizione: "Traduzione con contesto brevettuale",
      icona: "language",
      categoria: "pipeline_idea",
      occhio: {
        analisi: ["testo"],
        router: "cascata"
      },
      pacchetti: { starter: false, pro: true, enterprise: true },
      limiti: { starter: 0, pro: 5, enterprise: "illimitati" }
    },
    estensione_epo: {
      id: "estensione_epo",
      nome: "Estensione Europea (EPO)",
      descrizione: "Gestione EPO, scadenze, rimborsi",
      icona: "europe",
      categoria: "estensione",
      occhio: {
        analisi: ["testo"],
        canali: ["epo_portal"],
        router: "default",
        scadenza: "2027-05-22",
        rimborso: 1116.50
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 1, pro: 3, enterprise: "illimitati" }
    },
    estensione_pct: {
      id: "estensione_pct",
      nome: "Estensione Mondiale (PCT)",
      descrizione: "Gestione PCT/WIPO, scadenze 30 mesi",
      icona: "world",
      categoria: "estensione",
      occhio: {
        analisi: ["testo"],
        canali: ["wipo_portal"],
        router: "default",
        scadenza: "2027-05-22",
        rimborso: 1196.00
      },
      pacchetti: { starter: false, pro: true, enterprise: true },
      limiti: { starter: 0, pro: 2, enterprise: "illimitati" }
    },
    allert_ia: {
      id: "allert_ia",
      nome: "Allert IA - L'OCCHIO",
      descrizione: "Sorveglianza 24/7 su tutti i canali",
      icona: "eye",
      categoria: "sorveglianza",
      occhio: {
        analisi: ["testo", "immagini", "geometrico", "video"],
        canali: "tutti",
        router: "cascata",
        azione_auto: true
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: {
        starter: { canali: 3, ricerche_giorno: 10 },
        pro: { canali: 10, ricerche_giorno: 100 },
        enterprise: { canali: "tutti", ricerche_giorno: "illimitati" }
      }
    },
    monitoraggio_dogane: {
      id: "monitoraggio_dogane",
      nome: "Monitoraggio Dogane UE",
      descrizione: "Sorveglianza sequestri merci contraffatte in tutta l'UE",
      icona: "shield",
      categoria: "sorveglianza",
      occhio: {
        analisi: ["documenti", "immagini_sequestro", "geometrico"],
        canali: ["dogane_ue"],
        router: "default",
        procura_richiesta: true,
        setup: "automatico_dopo_firma"
      },
      flusso_utente: [
        "Accedi al servizio",
        "Firma procura digitale (SPID/CIE)",
        "L'OCCHIO deposita AFA automaticamente",
        "Attendi notifiche dai doganieri",
        "Ricevi allert in dashboard con foto e documenti"
      ],
      pacchetti: {
        starter: { attivo: false, motivo: "Richiede setup legale avanzato" },
        pro: { attivo: true, limiti: { sequestri_mese: 5 } },
        enterprise: { attivo: true, limiti: { sequestri_mese: "illimitati" } }
      },
      messaggio_rassicurante: "Lo Stato Europeo sequestra per te. Tu dormi, L'OCCHIO veglia."
    },
    ebay_vero: {
      id: "ebay_vero",
      nome: "eBay VeRO Automation",
      descrizione: "Rimozione automatica inserzioni abusive",
      icona: "gavel",
      categoria: "sorveglianza",
      occhio: {
        analisi: ["testo", "immagini"],
        canali: ["ebay"],
        router: "default",
        azione_auto: true
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: 5, pro: 50, enterprise: "illimitati" }
    },
    aliexpress_p2p: {
      id: "aliexpress_p2p",
      nome: "AliExpress P2P Scraping",
      descrizione: "Scraping decentralizzato + visione AI",
      icona: "network",
      categoria: "sorveglianza",
      occhio: {
        analisi: ["immagini", "geometrico"],
        canali: ["aliexpress", "alibaba", "temu"],
        router: "immagini",
        p2p: true
      },
      pacchetti: { starter: false, pro: true, enterprise: true },
      limiti: { starter: 0, pro: 10, enterprise: "illimitati" }
    },
    calendario_scadenze: {
      id: "calendario_scadenze",
      nome: "Calendario Scadenze",
      descrizione: "Tutte le scadenze brevettuali",
      icona: "calendar",
      categoria: "utility",
      occhio: {
        analisi: ["testo"],
        router: "default"
      },
      pacchetti: { starter: true, pro: true, enterprise: true },
      limiti: { starter: "illimitati", pro: "illimitati", enterprise: "illimitati" }
    },
    report_settimanale: {
      id: "report_settimanale",
      nome: "Report Settimanale",
      descrizione: "PDF con riepilogo attivita",
      icona: "file-pdf",
      categoria: "utility",
      occhio: {
        analisi: ["testo"],
        router: "default"
      },
      pacchetti: { starter: false, pro: true, enterprise: true },
      limiti: { starter: 0, pro: 1, enterprise: "illimitati" }
    }
  },
  
  // ============================================================
  // PACCHETTI
  // ============================================================
  pacchetti: {
    starter: {
      id: "starter",
      nome: "Starter",
      prezzo: 29,
      servizi_inclusi: 3,
      servizi_disponibili: [
        "occhio_lince", "occhio_falco",
        "ricerca_brevetti", "redazione_rivendicazioni", "verifica_novita",
        "allert_ia", "ebay_vero", "calendario_scadenze", "estensione_epo"
      ],
      occhio_limiti: { premium: 0, cheap: 0, free: "illimitati" },
      canali_allert: 3,
      messaggio: "3 servizi AI per iniziare a proteggere la tua idea"
    },
    pro: {
      id: "pro",
      nome: "Pro",
      prezzo: 99,
      servizi_inclusi: 10,
      servizi_disponibili: [
        "occhio_lince", "occhio_falco", "occhio_aquila",
        "ricerca_brevetti", "redazione_rivendicazioni", "verifica_novita",
        "valutazione_tecnica", "traduzione_tecnica", "estensione_epo",
        "estensione_pct", "allert_ia", "monitoraggio_dogane", "ebay_vero",
        "aliexpress_p2p", "calendario_scadenze", "report_settimanale"
      ],
      occhio_limiti: { premium: 0, cheap: 0, free: "illimitati" },
      canali_allert: 10,
      messaggio: "10 servizi AI per professionisti e startup"
    },
    enterprise: {
      id: "enterprise",
      nome: "Enterprise",
      prezzo: 299,
      servizi_inclusi: "tutti",
      servizi_disponibili: "tutti",
      occhio_limiti: { premium: 0, cheap: 0, free: "illimitati" },
      canali_allert: "tutti",
      priorità: "massima",
      messaggio: "Tutti i servizi illimitati per aziende e studi legali"
    }
  },
  
  // ============================================================
  // BETA - Protezione Anti-Esplosione
  // ============================================================
  beta: {
    attivo: true,
    durata_giorni: 60,
    accesso: "aperto_a_tutti",
    
    fair_share: {
      attivo: true,
      limite_giornaliero_totale: 200,
      calcolo: "Math.min(Math.floor(200 / utenti_attivi_oggi), 10)",
      min_per_utente: 1,
      max_per_utente: 10,
      overflow_batch: true,
      orario_batch: "02:00-06:00"
    },
    
    messaggi: {
      benvenuto: "Benvenuto in BrevettIAmo Beta! Hai {n} analisi IA gratis oggi.",
      limite_raggiunto: "Hai usato le tue {n} analisi di oggi. Torna domani per altre {n}!",
      batch: "Tanti utenti oggi! La tua analisi sara pronta entro le 6:00. Ti avvisiamo via email!",
      fine_beta: "Beta terminata! Attiva il tuo pacchetto per continuare a usare L'OCCHIO."
    }
  },
  
  // ============================================================
  // DASHBOARD "DORMI TRA TRE GUANCIALI"
  // ============================================================
  dashboard: {
    widget: {
      occhio_stato: {
        posizione: "top_centrale",
        grandezza: "xl",
        testo: "L'OCCHIO e ATTIVO",
        sottotesto: "Sorveglianza 24/7 su {n_canali} canali",
        icona: "eye",
        colore: "verde",
        animazione: "pulse",
        messaggio: "Dormi tra tre guanciali. L'OCCHIO veglia per te."
      },
      servizi_attivi: {
        posizione: "left",
        tipo: "grid",
        mostra: "servizi_del_pacchetto"
      },
      allert_recenti: {
        posizione: "right",
        tipo: "lista",
        max: 10,
        filtri: ["tutti", "warning", "critical"]
      },
      statistiche: {
        posizione: "bottom",
        metriche: [
          "infrazioni_rilevate",
          "azioni_auto_eseguite",
          "risparmio_economico",
          "canali_monitorati"
        ]
      },
      calendario_scadenze: {
        posizione: "bottom_right",
        scadenze: ["epo", "pct", "rinnovi", "tasse_annuali"]
      }
    },
    messaggio_benvenuto: "Dormi tra tre guanciali. L'OCCHIO veglia per te."
  }
};

// Esportazione per moduli
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BREVETTIAMO;
}
