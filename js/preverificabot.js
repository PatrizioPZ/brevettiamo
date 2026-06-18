/* ============================================
   BREVETTIAMO — PreVerificaBot
   3 domande per valutare brevettabilità
   ============================================ */

const PreVerificaBot = {
    currentStep: 1,
    totalSteps: 3,
    answers: {},
    scores: {},

    init() {
        this.setupEventListeners();
        this.updateProgress();
    },

    setupEventListeners() {
        // Risposte
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        });

        // Navigazione
        document.getElementById('next-btn').addEventListener('click', () => this.next());
        document.getElementById('prev-btn').addEventListener('click', () => this.prev());
    },

    handleAnswer(e) {
        const btn = e.currentTarget;
        const container = btn.closest('.question-container');
        const step = parseInt(container.dataset.step);

        // Rimuovi selezione precedente
        container.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Salva risposta
        this.answers[step] = btn.dataset.value;
        this.scores[step] = parseInt(btn.dataset.score);

        // Abilita avanti
        document.getElementById('next-btn').disabled = false;

        Logger.info('Pre-verifica answer', { step, answer: btn.dataset.value, score: btn.dataset.score });
    },

    next() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.showResult();
        }
    },

    prev() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    },

    showStep(step) {
        // Nascondi tutte
        document.querySelectorAll('.question-container').forEach(c => c.classList.remove('active'));

        // Mostra corrente
        const current = document.querySelector(`[data-step="${step}"]`);
        if (current) current.classList.add('active');

        // Aggiorna progress
        this.updateProgress();

        // Aggiorna bottoni
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
        nextBtn.textContent = step === this.totalSteps ? 'Vedi Risultato →' : 'Avanti →';

        // Disabilita avanti se non c'è risposta per questo step
        nextBtn.disabled = !this.answers[step];
    },

    updateProgress() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    },

    showResult() {
        const totalScore = Object.values(this.scores).reduce((a, b) => a + b, 0);
        const maxScore = this.totalSteps * 10;
        const percentage = (totalScore / maxScore) * 100;

        Logger.info('Pre-verifica completed', { totalScore, percentage, answers: this.answers });

        // Determina risultato
        let result = this.calculateResult(percentage);

        // Mostra risultato
        document.querySelectorAll('.question-container').forEach(c => c.classList.remove('active'));
        document.getElementById('nav-buttons').style.display = 'none';
        document.getElementById('progress-bar').style.display = 'none';

        const resultContainer = document.getElementById('result');
        resultContainer.classList.add('active');

        document.getElementById('result-icon').textContent = result.icon;
        document.getElementById('result-title').textContent = result.title;
        document.getElementById('result-title').style.color = result.color;
        document.getElementById('result-description').innerHTML = result.description;
        document.getElementById('result-details').innerHTML = result.details;

        // Salva in storage per usare dopo login
        Storage.set('preverifica_result', {
            score: totalScore,
            percentage,
            answers: this.answers,
            recommendation: result.type,
            timestamp: new Date().toISOString()
        });
    },

    calculateResult(percentage) {
        // Verifica divulgazione (dealbreaker)
        if (this.answers[3] === 'si') {
            return {
                type: 'divulgato',
                icon: '⚠️',
                title: 'Attenzione: Idea Divulgata',
                color: '#FF9800',
                description: `
                    <p><strong>Hai già divulgato pubblicamente la tua idea.</strong></p>
                    <p>In Italia hai 12 mesi dalla prima divulgazione per depositare il brevetto (grazia). 
                    Se sono passati più di 12 mesi, l'idea non è più brevettabile.</p>
                    <p><strong>Consiglio:</strong> Verifica la data esatta della prima divulgazione. 
                    Se sei ancora nei 12 mesi, <strong>agisci immediatamente</strong>.</p>
                `,
                details: `
                    <h4>⚡ Azioni urgenti</h4>
                    <ul>
                        <li>Verifica la data esatta della prima divulgazione</li>
                        <li>Se nei 12 mesi: procedi subito con NDA + deposito</li>
                        <li>Se oltre 12 mesi: considera un marchio o modello</li>
                        <li>Consulta un brevettista per valutare opzioni</li>
                    </ul>
                `
            };
        }

        if (percentage >= 80) {
            return {
                type: 'brevetto',
                icon: '🟢',
                title: 'Ottimo: Procedi con il Brevetto',
                color: '#00C853',
                description: `
                    <p>La tua idea ha <strong>alte probabilità di essere brevettabile</strong>.</p>
                    <p>È nuova, industriale e non divulgata. Procedi con la formalizzazione del documento.</p>
                `,
                details: `
                    <h4>✅ Prossimi passi</h4>
                    <ul>
                        <li>Accedi a BrevettIAmo e firma l'NDA</li>
                        <li>Compila le 5 domande del ChatBot</li>
                        <li>Genera il documento con AI (€300)</li>
                        <li>Verifica con 8 controlli automatici</li>
                        <li>Firma e deposita all'UIBM</li>
                    </ul>
                `
            };
        } else if (percentage >= 50) {
            return {
                type: 'marchio_modello',
                icon: '🟡',
                title: 'Promettente: Considera Marchio o Modello',
                color: '#FF9800',
                description: `
                    <p>La tua idea ha <strong>potenziale ma presenta incertezze</strong>.</p>
                    <p>Potrebbe non essere brevettabile "invenzione industriale", ma potrebbe essere protetta come:</p>
                `,
                details: `
                    <h4>🎯 Opzioni alternative</h4>
                    <ul>
                        <li><strong>Marchio</strong> — se è un nome/logo distintivo (€69)</li>
                        <li><strong>Modello di utilità</strong> — se è un miglioramento tecnico (€200)</li>
                        <li><strong>Disegno industriale</strong> — se è estetico (€99)</li>
                        <li><strong>Brevetto</strong> — dopo approfondimento con ChatBot</li>
                    </ul>
                `
            };
        } else {
            return {
                type: 'non_brevettabile',
                icon: '🔴',
                title: 'Rischio: Probabilmente Non Brevettabile',
                color: '#F44336',
                description: `
                    <p>La tua idea <strong>presenta criticità importanti</strong> per la brevettabilità.</p>
                    <p>Potrebbe essere già nota, non industriale, o già divulgata oltre i 12 mesi.</p>
                `,
                details: `
                    <h4>💡 Alternative</h4>
                    <ul>
                        <li><strong>Know-how</strong> — segreto industriale, non divulgare</li>
                        <li><strong>Marchio</strong> — proteggi il nome/comunicazione</li>
                        <li><strong>Copyright</strong> — se è software o contenuto</li>
                        <li><strong>Consulenza</strong> — parla con un brevettista (upgrade)</li>
                    </ul>
                `
            };
        }
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    PreVerificaBot.init();
});
