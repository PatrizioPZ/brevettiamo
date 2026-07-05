// js/ia-engine.js - Motore IA BrevettIAmo con proxy Supabase
// Gestisce chiamate API, retry, errori, salvataggio risultati

class IAEngine {
    constructor() {
        this.proxyUrl = CONFIG.PROXY_URL;
        this.modelli = CONFIG.MODELLI;
        this.timeout = CONFIG.TIMEOUT_MS;
        this.maxRetry = CONFIG.MAX_RETRY;

        // Verifica configurazione
        if (!this.proxyUrl || this.proxyUrl === 'INSERISCI_URL_PROXY') {
            console.error('URL proxy non configurato! Modifica config.js');
        }
    }

    async chiama(servizioId, descrizione, files = [], tipoModello = 'testo') {
        const tentativi = [];
        let ultimoErrore = null;

        for (let tentativo = 0; tentativo <= this.maxRetry; tentativo++) {
            try {
                console.log(`Chiamata IA - Tentativo ${tentativo + 1}/${this.maxRetry + 1}`);

                const risultato = await this._eseguiChiamata(servizioId, descrizione, files, tipoModello);

                this._salvaRisultato(servizioId, descrizione, risultato);

                return {
                    success: true,
                    contenuto: risultato.contenuto,
                    modello: risultato.modello,
                    tokens: risultato.tokens,
                    tempo: risultato.tempo,
                    tentativi: tentativo + 1
                };

            } catch (errore) {
                ultimoErrore = errore;
                tentativi.push({
                    tentativo: tentativo + 1,
                    errore: errore.message,
                    timestamp: new Date().toISOString()
                });

                console.warn(`Tentativo ${tentativo + 1} fallito:`, errore.message);

                if (tentativo < this.maxRetry) {
                    const attesa = Math.pow(2, tentativo) * 1000;
                    console.log(`Attesa ${attesa}ms prima del retry...`);
                    await this._sleep(attesa);

                    if (tentativo === 1) tipoModello = 'bilanciato';
                    if (tentativo === 2) tipoModello = 'rapido';
                }
            }
        }

        return {
            success: false,
            errore: ultimoErrore.message,
            tentativi: tentativi,
            fallback: true
        };
    }

    async _eseguiChiamata(servizioId, descrizione, files, tipoModello) {
        const modello = this.modelli[tipoModello] || this.modelli.testo;

        let promptTemplate = PROMPTS[servizioId] || PROMPTS['default'];
        const prompt = promptTemplate.replace('{descrizione}', descrizione);

        // Mappa servizio -> contesto per l'IA
        const CONTESTO_SERVIZIO = {
            'servizio-priorart': 'Esegui una ricerca Prior Art completa. Analizza la descrizione dell invenzione, identifica parole chiave tecniche, e cerca nella banca dati EPO/USPTO/WIPO documenti simili precedenti. Reporta: titolo invenzione, classificazioni IPC/CPC, parole chiave, documenti rilevanti trovati (titolo, numero brevetto, data, rilevanza), e analisi della novita.',
            'servizio-priorart-base': 'Esegui una ricerca Prior Art base nelle principali banche dati (EP, US, WO). Identifica documenti simili e valuta la novita dell invenzione.',
            'servizio-priorart-avanzata': 'Esegui una ricerca Prior Art avanzata approfondita in 15+ banche dati globali. Analisi famiglie brevettuali, mappa concorrenti, citazioni, e white spaces. Report strategico completo.',
            'servizio-rivendicazioni': 'Redigi rivendicazioni brevettuali professionali. Dalla descrizione tecnica estrai le caratteristiche essenziali e redigi rivendicazioni indipendenti e dipendenti in formato legale italiano, conformi UIBM.',
            'servizio-claims-base': 'Redigi rivendicazioni principali indipendenti. Definisci il campo di protezione essenziale dell invenzione.',
            'servizio-claims-pro': 'Redigi rivendicazioni complete: indipendenti + dipendenti. Strategia di protezione gerarchica con claims di fallback.',
            'servizio-traduzione-claims': 'Traduci le rivendicazioni brevettuali in inglese tecnico-legale per depositi internazionali (PCT, EPO).',
            'servizio-deposito': 'Prepara documentazione completa per deposito UIBM: descrizione tecnica, rivendicazioni, tavole, abstract. Verifica conformita formale.',
            'servizio-analisi-brevettabilita': 'Valuta i 3 criteri legali: novita, attivita inventiva, applicabilita industriale. Analisi dettagliata con riferimenti normativi.',
            'servizio-analisi-tecnica': 'Analisi tecnica approfondita: fattibilita, benchmark tecnologico, vantaggi competitivi, limiti tecnici.',
            'servizio-monitoraggio': 'Configura monitoraggio scadenze brevettuali: rinnovi, opposizioni, concorrenti. Piano alert e timeline.',
            'servizio-monitoraggio-concorrenza': 'Analisi portfolio brevettuale concorrenti in 5 settori. Mappa tecnologica, trend, e potenziali rischi.',
            'servizio-consulenza': 'Prepara report di consulenza brevettuale strategica: next steps, rischi, opportunita, timeline, budget stimato.',
            'servizio-ricerca-figurativa': 'Ricerca in banche dati figurative EUIPO/USPTO/WIPO per design e marchi simili alla tua invenzione.',
            'servizio-analisi-nullita': 'Valuta la validita di un brevetto esistente: ricerca elementi invalidanti, prior art non considerato, difetti formali.',
            'servizio-opposizione': 'Prepara opposizione a brevetto: raccolta prove, redazione argomentazioni tecniche e legali, strategia processuale.',
            'servizio-licensing': 'Analisi opportunita licensing: mappa potenziali licensee, valutazione mercato, bozza contratto licenza.',
            'servizio-valorizzazione': 'Valutazione economica brevetto: metodo costo, mercato, reddito. Report per investitori o cessione.',
            'servizio-due-diligence': 'Due Diligence IP: analisi portfolio, validita brevetti, rischi di violazione, valutazione complessiva.',
            'servizio-freedom-to-operate': 'Verifica Freedom to Operate: ricerca brevetti esistenti che potrebbero essere violati, analisi rischio.',
            'servizio-patentability': 'Ricerca brevettuale in stile americano: focus prior art inglese, analisi citazioni, famiglie brevettuali.',
            'servizio-landscape': 'Landscape Analysis: mappa tecnologica settore, trend, concorrenti, white spaces, opportunita. Report strategico 50+ pagine.',
            'servizio-legale-base': 'Consulenza legale IP: revisione contratto NDA/licenza/cessione, note e raccomandazioni.',
            'servizio-tavole': 'Genera tavole tecniche professionali in formato SVG: viste assieme, esplose, sezioni, dettagli. Conformi UIBM.',
            'servizio-cad': 'Crea disegni tecnici CAD 2D/3D: viste proiettive, sezioni, dettagli. Formati DWG, STEP, IGES.',
            'default': 'Sei un assistente esperto in proprieta intellettuale. Analizza la richiesta e fornisci un output professionale in italiano.'
        };

        const contestoServizio = CONTESTO_SERVIZIO[servizioId] || CONTESTO_SERVIZIO['default'];

        const messages = [
            {
                role: 'system',
                content: `Sei un assistente esperto in proprieta intellettuale. ${contestoServizio} Rispondi sempre in italiano. Genera output in formato HTML strutturato con sezioni chiare, titoli, elenchi puntati. Non usare markdown, solo HTML. Se il servizio richiede ricerca in banche dati, simula la ricerca e presenta risultati realistici basati sulla descrizione fornita.`
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        if (files && files.length > 0) {
            const filesDesc = files.map(f => `[File: ${f.nome}, tipo: ${f.tipo}]`).join('\n');
            messages[1].content += '\n\nFile allegati:\n' + filesDesc;
        }

        const inizio = Date.now();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // CHIAMATA AL PROXY SUPABASE (non diretto a Groq)
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modello,
                    messages: messages,
                    temperature: CONFIG.DEFAULT_TEMPERATURE,
                    max_tokens: CONFIG.DEFAULT_MAX_TOKENS
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Proxy errore ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const tempo = Date.now() - inizio;

            return {
                contenuto: data.choices[0].message.content,
                modello: modello,
                tokens: {
                    prompt: data.usage?.prompt_tokens || 0,
                    completion: data.usage?.completion_tokens || 0,
                    total: data.usage?.total_tokens || 0
                },
                tempo: tempo,
                raw: data
            };

        } catch (errore) {
            clearTimeout(timeoutId);
            throw errore;
        }
    }

    _salvaRisultato(servizioId, descrizione, risultato) {
        const storageKey = 'brevettiamo_risultato_ia';
        const dati = {
            servizioId: servizioId,
            descrizione: descrizione,
            contenuto: risultato.contenuto,
            modello: risultato.modello,
            tokens: risultato.tokens,
            tempo: risultato.tempo,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem(storageKey, JSON.stringify(dati));
            console.log('Risultato IA salvato in localStorage');
        } catch (e) {
            console.warn('Impossibile salvare in localStorage:', e);
        }
    }

    static recuperaRisultato() {
        try {
            const dati = localStorage.getItem('brevettiamo_risultato_ia');
            return dati ? JSON.parse(dati) : null;
        } catch (e) {
            return null;
        }
    }

    static isConfigurato() {
        return CONFIG.PROXY_URL && CONFIG.PROXY_URL.length > 10;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

if (typeof window !== 'undefined') {
    window.IAEngine = IAEngine;
}
