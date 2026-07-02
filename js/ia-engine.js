// js/ia-engine.js - Motore IA BrevettIAmo
class IAEngine {
    constructor() {
        this.proxyUrl = CONFIG.PROXY_URL;
        this.modelli = CONFIG.MODELLI;
        this.timeout = CONFIG.TIMEOUT_MS;
        this.maxRetry = CONFIG.MAX_RETRY;
    }
    async chiama(servizioId, descrizione, files, tipoModello) {
        const tentativi = [];
        let ultimoErrore = null;
        for (let t = 0; t <= this.maxRetry; t++) {
            try {
                const risultato = await this._eseguiChiamata(servizioId, descrizione, files, tipoModello);
                this._salvaRisultato(servizioId, descrizione, risultato);
                return { success: true, contenuto: risultato.contenuto, modello: risultato.modello, tokens: risultato.tokens, tempo: risultato.tempo, tentativi: t + 1 };
            } catch (e) {
                ultimoErrore = e;
                tentativi.push({ tentativo: t + 1, errore: e.message, timestamp: new Date().toISOString() });
                if (t < this.maxRetry) await this._sleep(Math.pow(2, t) * 1000);
            }
        }
        return { success: false, errore: ultimoErrore.message, tentativi: tentativi, fallback: true };
    }
    async _eseguiChiamata(servizioId, descrizione, files, tipoModello) {
        const modello = this.modelli[tipoModello] || this.modelli.testo;
        const promptTemplate = PROMPTS[servizioId] || PROMPTS.default;
        const prompt = promptTemplate.replace(/{descrizione}/g, descrizione);
        const contesto = this._getContesto(servizioId);
        const messages = [
            { role: 'system', content: 'Sei un assistente esperto in proprieta intellettuale. ' + contesto + ' Rispondi in italiano. Genera output in HTML strutturato. Non usare markdown, solo HTML.' },
            { role: 'user', content: prompt }
        ];
        if (files && files.length > 0) {
            const filesDesc = files.map(f => '[File: ' + f.nome + ', tipo: ' + f.tipo + ']').join('\n');
            messages[1].content += '\n\nFile allegati:\n' + filesDesc;
        }
        const inizio = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modello, messages: messages, temperature: CONFIG.DEFAULT_TEMPERATURE, max_tokens: CONFIG.DEFAULT_MAX_TOKENS }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Proxy errore ' + response.status);
            const data = await response.json();
            return { contenuto: data.choices[0].message.content, modello: modello, tokens: { prompt: data.usage?.prompt_tokens || 0, completion: data.usage?.completion_tokens || 0, total: data.usage?.total_tokens || 0 }, tempo: Date.now() - inizio, raw: data };
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }
    _getContesto(servizioId) {
        const map = {
            'servizio-priorart': 'Esegui ricerca Prior Art completa in database EPO/USPTO/WIPO. Trova documenti simili precedenti e analizza novita.',
            'servizio-priorart-base': 'Esegui ricerca Prior Art base in banche dati EP/US/WO. Identifica documenti simili.',
            'servizio-priorart-avanzata': 'Esegui ricerca Prior Art avanzata in 15+ database globali. Analisi famiglie brevettuali e mappa concorrenti.',
            'servizio-rivendicazioni': 'Redigi rivendicazioni brevettuali professionali in formato legale italiano conformi UIBM.',
            'servizio-claims-base': 'Redigi rivendicazioni principali indipendenti.',
            'servizio-claims-pro': 'Redigi rivendicazioni complete con strategia gerarchica.',
            'servizio-traduzione-claims': 'Traduci rivendicazioni in inglese tecnico-legale per depositi internazionali.',
            'servizio-deposito': 'Prepara documentazione completa per deposito UIBM.',
            'servizio-analisi-brevettabilita': 'Valuta i 3 criteri legali: novita, attivita inventiva, applicabilita industriale.',
            'servizio-analisi-tecnica': 'Analisi tecnica approfondita: fattibilita, benchmark, vantaggi competitivi.',
            'servizio-monitoraggio': 'Configura monitoraggio scadenze brevettuali.',
            'servizio-monitoraggio-concorrenza': 'Analisi portfolio concorrenti in 5 settori.',
            'servizio-consulenza': 'Prepara report consulenza strategica brevettuale.',
            'servizio-ricerca-figurativa': 'Ricerca in banche dati figurative EUIPO/USPTO/WIPO.',
            'servizio-analisi-nullita': 'Valuta validita brevetto esistente.',
            'servizio-opposizione': 'Prepara opposizione a brevetto.',
            'servizio-licensing': 'Analisi opportunita licensing.',
            'servizio-valorizzazione': 'Valutazione economica brevetto.',
            'servizio-due-diligence': 'Due Diligence IP completa.',
            'servizio-freedom-to-operate': 'Verifica Freedom to Operate.',
            'servizio-patentability': 'Ricerca brevettuale stile americano.',
            'servizio-landscape': 'Landscape Analysis settore.',
            'servizio-legale-base': 'Consulenza legale IP.',
            'servizio-tavole': 'Genera tavole tecniche SVG conformi UIBM.',
            'servizio-cad': 'Crea disegni CAD 2D/3D.'
        };
        return map[servizioId] || 'Analizza la richiesta e fornisci output professionale in italiano.';
    }
    _salvaRisultato(servizioId, descrizione, risultato) {
        try {
            localStorage.setItem('brevettiamo_risultato_ia', JSON.stringify({
                servizioId: servizioId, descrizione: descrizione, contenuto: risultato.contenuto,
                modello: risultato.modello, tokens: risultato.tokens, tempo: risultato.tempo,
                timestamp: new Date().toISOString()
            }));
        } catch (e) { console.warn('Errore salvataggio:', e); }
    }
    static recuperaRisultato() {
        try { const d = localStorage.getItem('brevettiamo_risultato_ia'); return d ? JSON.parse(d) : null; } catch (e) { return null; }
    }
    static isConfigurato() { return CONFIG.PROXY_URL && CONFIG.PROXY_URL.length > 10; }
    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
if (typeof window !== 'undefined') window.IAEngine = IAEngine;
