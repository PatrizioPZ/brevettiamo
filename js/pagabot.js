/* ============================================
   BREVETTIAMO — PagaBot
   Stripe + Lemon Switch integration
   ============================================ */

const PagaBot = {
    stripe: null,
    elements: null,
    selectedService: 'documento',
    selectedPrice: 300,
    selectedMethod: 'card',

    services: {
        documento: { name: 'Documento Completo', price: 300, description: 'Descrizione + rivendicazioni + abstract' },
        bundle: { name: 'Bundle Completo', price: 400, description: 'Tutto + disegni SVG + ricerca + bandi' },
        ricerca: { name: 'Solo Ricerca', price: 49, description: 'Anteriorità e fattibilità' }
    },

    init() {
        this.setupServiceSelection();
        this.setupPaymentMethods();
        this.setupStripe();
        this.loadUserData();
    },

    setupServiceSelection() {
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const target = e.currentTarget;

                // Rimuovi selezione precedente
                document.querySelectorAll('.service-option').forEach(o => {
                    o.classList.remove('selected');
                    o.querySelector('input').checked = false;
                });

                // Seleziona nuovo
                target.classList.add('selected');
                target.querySelector('input').checked = true;

                this.selectedService = target.dataset.service;
                this.selectedPrice = parseInt(target.dataset.price);

                // Aggiorna prezzo
                document.getElementById('total-price').textContent = `€${this.selectedPrice}`;
                document.getElementById('pay-btn').textContent = `Paga €${this.selectedPrice} — Genera Documento`;

                Logger.info('Service selected', { service: this.selectedService, price: this.selectedPrice });
            });
        });
    },

    setupPaymentMethods() {
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.selectedMethod = e.currentTarget.dataset.method;

                // Mostra/nascondi stripe element
                const stripeEl = document.getElementById('stripe-element');
                if (this.selectedMethod === 'card') {
                    stripeEl.style.display = 'flex';
                } else {
                    stripeEl.style.display = 'none';
                }

                Logger.info('Payment method selected', { method: this.selectedMethod });
            });
        });
    },

    setupStripe() {
        // Inizializza Stripe (in produzione con chiave reale)
        if (typeof Stripe !== 'undefined') {
            this.stripe = Stripe(CONFIG.STRIPE_PUBLIC_KEY);

            // Crea elementi Stripe
            const elements = this.stripe.elements({
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#003366',
                        borderRadius: '12px'
                    }
                }
            });

            const cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        fontFamily: 'Inter, sans-serif',
                        '::placeholder': { color: '#8a8a9a' }
                    }
                }
            });

            // In produzione, monta su un div specifico
            // cardElement.mount('#card-element');

            this.elements = elements;
            Logger.info('Stripe initialized');
        } else {
            Logger.warn('Stripe not loaded');
        }
    },

    loadUserData() {
        // Carica dati utente da storage
        const user = Storage.get('user_temp');
        if (user) {
            document.getElementById('bill-nome').value = user.nome || '';
            document.getElementById('bill-cognome').value = user.cognome || '';
            document.getElementById('bill-email').value = user.email || '';
        }
    },

    async processPayment() {
        const btn = document.getElementById('pay-btn');

        // Validazione
        const nome = document.getElementById('bill-nome').value;
        const cognome = document.getElementById('bill-cognome').value;
        const email = document.getElementById('bill-email').value;
        const cf = document.getElementById('bill-cf').value;
        const terms = document.getElementById('terms-accept').checked;

        if (!nome || !cognome || !email || !cf) {
            UI.toast('Compila tutti i campi obbligatori', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            UI.toast('Inserisci un email valida', 'error');
            return;
        }

        if (!terms) {
            UI.toast('Accetta i termini di servizio', 'error');
            return;
        }

        Utils.setLoading(btn, true);

        try {
            // 1. Crea sessione Stripe
            const paymentData = {
                service: this.selectedService,
                price: this.selectedPrice,
                customer: {
                    nome,
                    cognome,
                    email,
                    cf,
                    pec: document.getElementById('bill-pec').value
                },
                metadata: {
                    user_id: Storage.get('user_id'),
                    classification: Storage.get('chat_classification')?.type,
                    preverifica: Storage.get('preverifica_result')?.percentage
                }
            };

            Logger.info('Payment initiated', paymentData);

            // Simula creazione sessione (in produzione: chiamata backend)
            // const session = await this.createStripeSession(paymentData);

            // 2. Salva in DB
            if (supabase) {
                const { data, error } = await DB.create('pagamenti', {
                    tipo: this.selectedService,
                    importo: this.selectedPrice,
                    stato: 'pending',
                    dati_fatturazione: paymentData.customer
                });

                if (error) throw error;
                Storage.set('payment_id', data[0].id);
            }

            // 3. Simula redirect a Stripe Checkout
            // In produzione: window.location.href = session.url;

            // 4. Per demo, simula successo
            setTimeout(() => {
                Storage.set('payment_status', 'completed');
                Storage.set('payment_service', this.selectedService);

                // 5. Lemon Switch: genera fattura
                this.generateInvoice(paymentData);

                // Redirect a successo
                window.location.href = 'successo.html';
            }, 2000);

        } catch (error) {
            Logger.error('Payment error', error);
            UI.toast('Errore durante il pagamento. Riprova.', 'error');
            Utils.setLoading(btn, false);
        }
    },

    async createStripeSession(data) {
        // In produzione: chiamata a Supabase Edge Function
        // che crea la sessione Stripe
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async generateInvoice(paymentData) {
        // Lemon Switch: genera fattura elettronica
        Logger.info('Invoice generation requested', {
            customer: paymentData.customer,
            amount: paymentData.price,
            service: paymentData.service
        });

        // In produzione: chiamata API Lemon Switch
        // - Crea fattura XML/PA
        // - Invia a SDI se PA
        // - Invia PDF se privato
        // - Registra corrispettivo

        Storage.set('invoice_requested', true);
    },

    // Gestione webhook (per successo/cancel)
    handleSuccess(sessionId) {
        Logger.info('Payment success', { sessionId });
        Storage.set('payment_status', 'completed');
        window.location.href = 'successo.html';
    },

    handleCancel() {
        Logger.info('Payment cancelled');
        Storage.set('payment_status', 'cancelled');
        window.location.href = 'cancel.html';
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    PagaBot.init();
});
