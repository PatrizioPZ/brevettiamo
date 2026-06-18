/* ============================================
   BREVETTIAMO — GeneraBot
   Generazione documento brevettuale con Kimi AI
   ============================================ */

const GeneraBot = {
    currentStep: 0,
    totalSteps: 5,
    startTime: Date.now(),
    timerInterval: null,
    documentData: {},

    steps: [
        { id: 'analisi', name: 'Analisi', duration: 3000, progress: 20 },
        { id: 'descrizione', name: 'Descrizione', duration: 5000, progress: 40 },
        { id: 'rivendicazioni', name: 'Rivendicazioni', duration: 5000, progress: 60 },
        { id: 'abstract', name: 'Abstract', duration: 3000, progress: 80 },
        { id: 'figure', name: 'Figure', duration: 2000, progress: 100 }
    ],

    init() {
        this.loadData();
        this.buildPrompt();
        this.startGeneration();
        this.startTimer();
    },

    loadData() {
        // Carica dati da storage
        const classification = Storage.get('chat_classification') || {};
        const answers = Storage.get('chat_answers') || {};
        const preverifica = Storage.get('preverifica_result') || {};
        const user = Storage.get('user_temp') || {};

        this.documentData = {
            classification: classification.type || 'brevetto',
            title: classification.title || 'Invenzione Industriale',
            answers: answers,
            preverifica: preverifica,
            user: user,
            date: new Date().toISOString()
        };

        Logger.info('GeneraBot data loaded', this.documentData);
    },

    buildPrompt() {
        const data = this.documentData;

        const prompt = `Sei un redattore brevettuale esperto. Devi preparare un documento brevettuale completo in italiano per l'UIBM (Ufficio Italiano Brevetti e Marchi).

DATI DELLA PRATICA:
- Tipo: ${data.classification}
- Titolo proposto: ${data.title}
- Descrizione idea: ${data.answers[1] || 'Non fornita'}
- Settore: ${data.answers[2] || 'Non specificato'}
- Vantaggio tecnico: ${data.answers[3] || 'Non specificato'}
- Categoria: ${data.answers[4] || 'Non classificata'}
- Documentazione: ${data.answers[5] || 'Nessuna'}

STRUTTURA RICHIESTA:
1. TITOLO: Massimo 15 parole, descrittivo e tecnico
2. DESCRIZIONE TECNICA: Minimo 3000 caratteri. Deve includere:
   - Campo tecnico
   - Stato dell'arte
   - Descrizione dettagliata dell'invenzione
   - Esempi di realizzazione
   - Vantaggi tecnici
3. RIVENDICAZIONI: Minimo 1 rivendicazione indipendente + dipendenti
   - Formato: "Rivendicazione X: [oggetto], caratterizzato perché [elemento distintivo]"
   - Numerazione gerarchica (1, 1.1, 1.1.1)
4. ABSTRACT: Massimo 1500 caratteri, riassunto tecnico
5. FIGURE: Descrizione delle figure da allegare (minimo 2)

REQUISITI:
- Linguaggio tecnico-formale
- Coerenza tra descrizione e rivendicazioni
- Tutti i termini tecnici definiti al primo uso
- Riferimenti numerici coerenti
- Conformità normativa UIBM 2026

Genera il documento completo in formato strutturato.`;

        document.getElementById('prompt-text').textContent = prompt;
        Storage.set('kimi_prompt', prompt);

        Logger.info('Prompt built', { length: prompt.length });
    },

    startGeneration() {
        // Simula generazione step-by-step (in produzione: chiamata API Kimi)
        this.processStep(0);
    },

    processStep(stepIndex) {
        if (stepIndex >= this.totalSteps) {
            this.completeGeneration();
            return;
        }

        const step = this.steps[stepIndex];

        // Aggiorna UI
        this.updateStep(stepIndex, 'active');
        this.updateProgress(step.progress);

        // Genera contenuto per lo step
        setTimeout(() => {
            this.generateContent(step.id);
            this.updateStep(stepIndex, 'completed');

            if (stepIndex + 1 < this.totalSteps) {
                this.updateStep(stepIndex + 1, 'active');
            }

            this.processStep(stepIndex + 1);
        }, step.duration);
    },

    generateContent(stepId) {
        const data = this.documentData;

        switch(stepId) {
            case 'analisi':
                // Analisi completata, prepara titolo
                const titolo = this.generateTitle(data);
                document.getElementById('doc-titolo').textContent = titolo;
                document.getElementById('doc-titolo').classList.remove('placeholder', 'generating');
                break;

            case 'descrizione':
                const descrizione = this.generateDescription(data);
                document.getElementById('doc-descrizione').textContent = descrizione;
                document.getElementById('doc-descrizione').classList.remove('placeholder', 'generating');
                break;

            case 'rivendicazioni':
                const rivendicazioni = this.generateClaims(data);
                document.getElementById('doc-rivendicazioni').textContent = rivendicazioni;
                document.getElementById('doc-rivendicazioni').classList.remove('placeholder');
                break;

            case 'abstract':
                const abstract = this.generateAbstract(data);
                document.getElementById('doc-abstract').textContent = abstract;
                document.getElementById('doc-abstract').classList.remove('placeholder');
                break;

            case 'figure':
                // Figure gestite da DisegnaBot
                break;
        }

        Logger.info('Content generated', { step: stepId });
    },

    generateTitle(data) {
        const sector = data.answers[2] || 'tecnico';
        const category = data.answers[4] || 'dispositivo';
        return `${category.charAt(0).toUpperCase() + category.slice(1)} per ${sector} con ${data.answers[3] || 'miglioramento tecnico'}`;
    },

    generateDescription(data) {
        return `CAMPO TECNICO
La presente invenzione si riferisce al campo ${data.answers[2] || 'tecnico'}, in particolare a un ${data.answers[4] || 'dispositivo'} per ${data.answers[1] || 'applicazione industriale'}.

STATO DELL'ARTE
Attualmente nel settore ${data.answers[2] || 'di riferimento'} esistono soluzioni che presentano limitazioni in termini di ${data.answers[3] || 'efficienza'}.

DESCRIZIONE DELL'INVENZIONE
L'oggetto della presente invenzione è un ${data.answers[4] || 'dispositivo'} caratterizzato perché comprende: 
- elemento strutturale principale;
- mezzi di ${data.answers[3] || 'funzionamento'};
- sistema di controllo integrato.

VANTAGGI TECNICI
La soluzione proposta consente di ottenere: ${data.answers[3] || 'miglioramento prestazionale'} rispetto alle soluzioni note.

[Documento completo in fase di generazione da Kimi AI - contenuto dimostrativo]`;
    },

    generateClaims(data) {
        return `Rivendicazione 1: ${data.answers[4] || 'Dispositivo'} per ${data.answers[2] || 'applicazione industriale'}, caratterizzato perché comprende mezzi per ${data.answers[3] || 'miglioramento tecnico'}.

Rivendicazione 1.1: ${data.answers[4] || 'Dispositivo'} secondo la rivendicazione 1, caratterizzato perché detti mezzi comprendono un sistema di controllo automatizzato.

Rivendicazione 1.1.1: ${data.answers[4] || 'Dispositivo'} secondo la rivendicazione 1.1, caratterizzato perché detto sistema di controllo è configurato per [dettaglio specifico].

Rivendicazione 2: Metodo per [operazione] utilizzando il ${data.answers[4] || 'dispositivo'} secondo la rivendicazione 1, caratterizzato perché comprende le fasi di: a) [fase 1]; b) [fase 2]; c) [fase 3].

[Elenco rivendicazioni in fase di completamento da Kimi AI - contenuto dimostrativo]`;
    },

    generateAbstract(data) {
        return `La presente invenzione riguarda un ${data.answers[4] || 'dispositivo'} per ${data.answers[2] || 'applicazione industriale'}. L'oggetto dell'invenzione è caratterizzato da mezzi che consentono di ${data.answers[3] || 'migliorare le prestazioni'}. L'invenzione trova applicazione nel settore ${data.answers[2] || 'tecnico'} e offre vantaggi in termini di efficienza, sostenibilità e costo.`;
    },

    updateStep(stepIndex, status) {
        const stepEl = document.getElementById(`step-${stepIndex + 1}`);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
            stepEl.classList.add(status);

            if (status === 'completed') {
                stepEl.querySelector('.step-dot').textContent = '✓';
            }
        }
    },

    updateProgress(percent) {
        document.getElementById('progress-fill').style.width = `${percent}%`;
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('timer-text').textContent = 
                `Tempo trascorso: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    },

    completeGeneration() {
        clearInterval(this.timerInterval);

        // Aggiorna status
        document.getElementById('status-icon').textContent = '✅';
        document.getElementById('status-title').textContent = 'Documento Generato!';
        document.getElementById('status-desc').textContent = 'Kimi ha completato la generazione. Procedi con la verifica.';

        // Salva documento
        const documento = {
            titolo: document.getElementById('doc-titolo').textContent,
            descrizione: document.getElementById('doc-descrizione').textContent,
            rivendicazioni: document.getElementById('doc-rivendicazioni').textContent,
            abstract: document.getElementById('doc-abstract').textContent,
            generato: new Date().toISOString()
        };

        Storage.set('documento_generato', documento);

        // Salva in DB
        if (supabase) {
            DB.update('pratiche', Storage.get('pratica_id'), {
                stato: 'generato',
                documento_url: JSON.stringify(documento)
            }).catch(() => {});
        }

        // Mostra bottoni azione
        document.getElementById('action-buttons').style.display = 'flex';

        Logger.info('Generation completed', documento);
        UI.toast('Documento generato con successo!', 'success');
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    GeneraBot.init();
});
