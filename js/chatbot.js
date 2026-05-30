/* ============================================
   BREVETTIAMO — ChatBot
   5 domande strutturate + classifica tipo
   ============================================ */

const ChatBot = {
    currentStep: 0,
    totalSteps: 5,
    answers: {},
    messages: [],

    questions: [
        {
            id: 1,
            text: "Ciao! Sono ChatBot, il tuo assistente brevettuale. Per iniziare, descrivimi la tua idea in una frase: cosa fa? Quale problema risolve?",
            placeholder: "Es. Un sistema di irrigazione che si adatta automaticamente al clima...",
            quickReplies: ["Tecnologia", "Prodotto", "Processo", "Software"],
            type: "open"
        },
        {
            id: 2,
            text: "Ottimo! Ora dimmi: qual è il settore industriale di applicazione? In quale ambito verrebbe usata o prodotta?",
            placeholder: "Es. Agricoltura, medicina, automotive, energia...",
            quickReplies: ["Agricoltura", "Medicina", "Automotive", "Energia", "ICT", "Altro"],
            type: "open"
        },
        {
            id: 3,
            text: "Qual è il vantaggio tecnico principale rispetto alle soluzioni esistenti? Cosa la rende migliore/unica?",
            placeholder: "Es. Riduce il consumo d'acqua del 40%, è più leggera, più veloce...",
            quickReplies: ["Efficienza", "Costo", "Sostenibilità", "Sicurezza", "Precisione"],
            type: "open"
        },
        {
            id: 4,
            text: "L'idea riguarda principalmente: un oggetto fisico (prodotto), un metodo/procedura (processo), un aspetto estetico (design), o un nome/logo (marchio)?",
            placeholder: "Scegli una categoria...",
            quickReplies: ["Prodotto fisico", "Processo/metodo", "Design/estetica", "Nome/logo", "Software/app"],
            type: "choice"
        },
        {
            id: 5,
            text: "Hai già realizzato un prototipo, disegni tecnici, o documentazione? Se sì, di che tipo?",
            placeholder: "Es. Schizzi a mano, CAD 3D, prototipo funzionante, nulla...",
            quickReplies: ["Schizzi", "Disegni CAD", "Prototipo", "Documento", "Niente ancora"],
            type: "open"
        }
    ],

    init() {
        this.renderMessages();
        this.showTyping(() => {
            this.addBotMessage(this.questions[0].text);
            this.showQuickReplies(0);
        });
        this.setupInput();
    },

    setupInput() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        input.placeholder = this.questions[0].placeholder;
    },

    showTyping(callback) {
        const container = document.getElementById('chat-messages');
        const typingId = 'typing-' + Date.now();

        const typingHTML = `
            <div class="message bot" id="${typingId}">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', typingHTML);
        container.scrollTop = container.scrollHeight;

        setTimeout(() => {
            document.getElementById(typingId)?.remove();
            if (callback) callback();
        }, 1500);
    },

    addBotMessage(text) {
        const container = document.getElementById('chat-messages');
        const messageHTML = `
            <div class="message bot">
                <div class="message-avatar">🤖</div>
                <div class="message-content">${text}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', messageHTML);
        container.scrollTop = container.scrollHeight;
        this.messages.push({ role: 'bot', text });
    },

    addUserMessage(text) {
        const container = document.getElementById('chat-messages');
        const messageHTML = `
            <div class="message user">
                <div class="message-avatar">👤</div>
                <div class="message-content">${text}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', messageHTML);
        container.scrollTop = container.scrollHeight;
        this.messages.push({ role: 'user', text });
    },

    showQuickReplies(stepIndex) {
        const container = document.getElementById('quick-replies');
        const replies = this.questions[stepIndex]?.quickReplies || [];

        if (replies.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = replies.map(reply => `
            <button class="quick-reply" onclick="ChatBot.handleQuickReply('${reply}')">${reply}</button>
        `).join('');
    },

    handleQuickReply(text) {
        this.sendMessage(text);
    },

    sendMessage(text = null) {
        const input = document.getElementById('chat-input');
        const message = text || input.value.trim();

        if (!message) return;

        // Aggiungi messaggio utente
        this.addUserMessage(message);

        // Salva risposta
        this.answers[this.currentStep + 1] = message;

        // Pulisci input
        input.value = '';
        document.getElementById('quick-replies').innerHTML = '';

        Logger.info('Chat answer', { step: this.currentStep + 1, answer: message });

        // Prossima domanda o classifica
        this.currentStep++;

        if (this.currentStep < this.totalSteps) {
            // Aggiorna progresso
            this.updateProgress();

            // Mostra prossima domanda
            const nextQuestion = this.questions[this.currentStep];
            input.placeholder = nextQuestion.placeholder;

            this.showTyping(() => {
                this.addBotMessage(nextQuestion.text);
                this.showQuickReplies(this.currentStep);
            });
        } else {
            // Classifica
            this.updateProgress();
            this.classify();
        }
    },

    updateProgress() {
        const dots = document.querySelectorAll('.progress-chat .step-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < this.currentStep) {
                dot.classList.add('completed');
            } else if (index === this.currentStep) {
                dot.classList.add('active');
            }
        });

        document.getElementById('progress-text').textContent = 
            this.currentStep < this.totalSteps 
                ? `Domanda ${this.currentStep + 1} di ${this.totalSteps}`
                : 'Classificazione...';
    },

    classify() {
        // Analisi risposte per classificazione
        const q4 = this.answers[4]?.toLowerCase() || '';
        const q1 = this.answers[1]?.toLowerCase() || '';
        const q3 = this.answers[3]?.toLowerCase() || '';

        let classification = {
            type: 'brevetto',
            icon: '🔬',
            title: 'Brevetto per Invenzione Industriale',
            description: 'La tua idea sembra essere un'invenzione industriale brevettabile: nuova, inventiva e industriale.',
            price: '€300',
            priceNote: 'Documento completo pronto per UIBM',
            cta: 'Procedi al Pagamento →'
        };

        // Classifica per tipo
        if (q4.includes('design') || q4.includes('estetica') || q4.includes('aspetto')) {
            classification = {
                type: 'disegno',
                icon: '🎨',
                title: 'Disegno Industriale',
                description: 'La tua idea riguarda principalmente l'aspetto estetico/ornamentale di un prodotto.',
                price: '€99',
                priceNote: 'Disegno industriale pronto per deposito',
                cta: 'Procedi al Pagamento →'
            };
        } else if (q4.includes('marchio') || q4.includes('nome') || q4.includes('logo')) {
            classification = {
                type: 'marchio',
                icon: '™️',
                title: 'Marchio',
                description: 'La tua idea è un nome, logo o segno distintivo per identificare prodotti/servizi.',
                price: '€69',
                priceNote: 'Ricerca anteriorità + domanda pronta',
                cta: 'Procedi al Pagamento →'
            };
        } else if (q4.includes('software') || q4.includes('app') || q1.includes('software')) {
            classification = {
                type: 'software',
                icon: '💻',
                title: 'Brevetto Software (se industriale)',
                description: 'Il software può essere brevettato se produce un effetto tecnico ulteriore. Valuteremo caso per caso.',
                price: '€300',
                priceNote: 'Valutazione specifica per software industriale',
                cta: 'Procedi al Pagamento →'
            };
        } else if (q4.includes('processo') || q4.includes('metodo')) {
            classification = {
                type: 'processo',
                icon: '⚙️',
                title: 'Brevetto per Processo',
                description: 'La tua idea è un metodo o procedimento industriale brevettabile.',
                price: '€300',
                priceNote: 'Documento processo pronto per UIBM',
                cta: 'Procedi al Pagamento →'
            };
        }

        // Salva classificazione
        Storage.set('chat_classification', classification);
        Storage.set('chat_answers', this.answers);

        Logger.info('Classification complete', classification);

        // Mostra risultato
        this.showClassification(classification);
    },

    showClassification(classification) {
        // Nascondi input
        document.getElementById('input-area').style.display = 'none';

        // Mostra risultato
        const result = document.getElementById('classification-result');
        result.classList.add('active');

        document.getElementById('class-icon').textContent = classification.icon;
        document.getElementById('class-title').textContent = classification.title;
        document.getElementById('class-description').textContent = classification.description;
        document.getElementById('class-price').textContent = classification.price;
        document.getElementById('class-price-note').textContent = classification.priceNote;
        document.getElementById('class-cta').textContent = classification.cta;

        // Messaggio finale bot
        this.showTyping(() => {
            this.addBotMessage(`Perfetto! Ho classificato la tua idea come: **${classification.title}**. Il costo per formalizzare il documento è **${classification.price}**. Clicca il pulsante qui sotto per procedere al pagamento sicuro.`);
        });
    },

    renderMessages() {
        // Inizializza container vuoto
        document.getElementById('chat-messages').innerHTML = '';
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    ChatBot.init();
});
