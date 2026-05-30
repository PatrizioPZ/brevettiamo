/* ============================================
   BREVETTIAMO — FirmaBot
   Firma OTP/SPID + marca temporale
   ============================================ */

const FirmaBot = {
    selectedMethod: null,
    otpCode: null,
    otpExpiry: null,
    timerInterval: null,
    documentHash: null,

    init() {
        this.loadDocument();
        this.generateDocumentHash();
    },

    loadDocument() {
        const doc = Storage.get('documento_assemblato') || {};

        document.getElementById('doc-title').textContent = doc.titolo || 'Documento Brevetto';
        document.getElementById('doc-type').textContent = Storage.get('chat_classification')?.type || 'Brevetto';
        document.getElementById('doc-pages').textContent = '12'; // Stimato

        Logger.info('Document loaded for signing', { title: doc.titolo });
    },

    generateDocumentHash() {
        // Simula hash SHA-256 del documento
        const hash = Array.from({length: 64}, () => 
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');

        this.documentHash = hash;
        document.getElementById('doc-hash').textContent = hash.substring(0, 16) + '...';

        Logger.info('Document hash generated', { hash: hash.substring(0, 16) });
    },

    selectMethod(method) {
        this.selectedMethod = method;

        // Rimuovi selezione precedente
        document.querySelectorAll('.sign-method').forEach(m => m.classList.remove('selected'));
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');

        // Mostra form appropriato
        document.getElementById('otp-form').classList.remove('active');
        document.getElementById('spid-form').style.display = 'none';
        document.getElementById('timestamp-info').style.display = 'block';
        document.getElementById('ts-date').textContent = new Date().toLocaleString('it-IT');

        if (method === 'otp-email' || method === 'otp-sms') {
            this.sendOTP(method);
            document.getElementById('otp-form').classList.add('active');
        } else if (method === 'spid') {
            document.getElementById('spid-form').style.display = 'block';
        }

        Logger.info('Sign method selected', { method });
    },

    sendOTP(method) {
        // Genera OTP casuale
        this.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minuti

        // Mostra OTP (in produzione: invia via email/SMS)
        document.getElementById('otp-code').textContent = this.otpCode;

        // Avvia timer
        this.startOTPTimer();

        const channel = method === 'otp-email' ? 'email' : 'SMS';
        UI.toast(`Codice OTP inviato via ${channel}`, 'success');
        Logger.info('OTP sent', { channel, code: this.otpCode });
    },

    startOTPTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            const remaining = Math.max(0, this.otpExpiry - Date.now());
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            document.getElementById('otp-timer').textContent = 
                `Scade tra: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (remaining <= 0) {
                clearInterval(this.timerInterval);
                document.getElementById('otp-code').textContent = '------';
                UI.toast('OTP scaduto. Richiedi un nuovo codice.', 'error');
            }
        }, 1000);
    },

    verifyOTP() {
        const input = document.getElementById('otp-input').value;

        if (input !== this.otpCode) {
            UI.toast('Codice OTP non valido', 'error');
            return;
        }

        if (Date.now() > this.otpExpiry) {
            UI.toast('OTP scaduto', 'error');
            return;
        }

        this.completeSignature('OTP');
    },

    redirectSPID() {
        // In produzione: redirect a SPID provider
        Logger.info('SPID redirect initiated');

        // Simula firma SPID
        setTimeout(() => {
            this.completeSignature('SPID');
        }, 2000);
    },

    completeSignature(method) {
        clearInterval(this.timerInterval);

        const timestamp = new Date();
        const signatureData = {
            method: method,
            timestamp: timestamp.toISOString(),
            documentHash: this.documentHash,
            signer: Storage.get('user_email'),
            ip: 'detected',
            userAgent: navigator.userAgent
        };

        // Salva firma
        Storage.set('firma_completata', signatureData);

        // Aggiorna DB
        if (supabase) {
            DB.update('pratiche', Storage.get('pratica_id'), {
                stato: 'firmato',
                data_firma: timestamp.toISOString()
            }).catch(() => {});
        }

        Logger.info('Signature completed', signatureData);

        // Mostra successo
        document.getElementById('sign-methods').style.display = 'none';
        document.getElementById('otp-form').style.display = 'none';
        document.getElementById('spid-form').style.display = 'none';
        document.getElementById('timestamp-info').style.display = 'none';
        document.getElementById('doc-summary').style.display = 'none';

        document.getElementById('success-sign').classList.add('active');
        document.getElementById('success-timestamp').textContent = 
            timestamp.toLocaleString('it-IT');
        document.getElementById('success-hash').textContent = 
            `SHA-256: ${this.documentHash}`;

        UI.toast('Documento firmato con successo!', 'success');
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    FirmaBot.init();
});
