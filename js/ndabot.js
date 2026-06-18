/* ============================================
   BREVETTIAMO — NDABot
   NDA digitale + GDPR compliance + tracciamento
   ============================================ */

const NDABot = {
    selectedMethod: null,
    userData: {},

    init() {
        this.setupEventListeners();
        this.collectDeviceInfo();
    },

    setupEventListeners() {
        // Selezione metodo firma
        document.querySelectorAll('.sign-option').forEach(opt => {
            opt.addEventListener('click', (e) => this.selectMethod(e));
        });

        // Checkbox accettazione
        const acceptCheck = document.getElementById('nda-accept');
        if (acceptCheck) {
            acceptCheck.addEventListener('change', () => this.toggleSubmit());
        }

        // Submit
        const submitBtn = document.getElementById('nda-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        }
    },

    selectMethod(e) {
        const option = e.currentTarget;
        document.querySelectorAll('.sign-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        this.selectedMethod = option.dataset.method;

        // Mostra form
        document.getElementById('nda-form').classList.add('active');

        // Mostra/nascondi campo telefono
        const phoneField = document.getElementById('phone-field');
        if (this.selectedMethod === 'otp-sms') {
            phoneField.style.display = 'block';
            document.getElementById('nda-telefono').required = true;
        } else {
            phoneField.style.display = 'none';
            document.getElementById('nda-telefono').required = false;
        }

        Logger.info('NDA method selected', { method: this.selectedMethod });
    },

    collectDeviceInfo() {
        this.userData = {
            ip: 'detecting...',
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };

        // Recupera IP
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                this.userData.ip = data.ip;
                document.getElementById('nda-ip').textContent = data.ip;
            })
            .catch(() => {
                this.userData.ip = 'unknown';
                document.getElementById('nda-ip').textContent = 'non disponibile';
            });

        document.getElementById('nda-date').textContent = Utils.formatDate(new Date(), 'DD/MM/YYYY HH:mm');
        document.getElementById('nda-browser').textContent = navigator.userAgent.split(' ')[0];
        document.getElementById('nda-timestamp').style.display = 'block';
    },

    toggleSubmit() {
        const accepted = document.getElementById('nda-accept').checked;
        const submitBtn = document.getElementById('nda-submit');
        submitBtn.disabled = !accepted;
    },

    async handleSubmit(e) {
        e.preventDefault();

        const nome = document.getElementById('nda-nome').value;
        const cognome = document.getElementById('nda-cognome').value;
        const email = document.getElementById('nda-email').value;
        const telefono = document.getElementById('nda-telefono').value;
        const idea = document.getElementById('nda-idea').value;

        if (!nome || !cognome || !email) {
            UI.toast('Compila tutti i campi obbligatori', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            UI.toast('Inserisci un email valida', 'error');
            return;
        }

        const btn = document.getElementById('nda-submit');
        Utils.setLoading(btn, true);

        try {
            // Salva dati utente
            const userData = {
                nome,
                cognome,
                email,
                telefono: telefono || null,
                nda_firmato: true,
                nda_data: new Date().toISOString(),
                nda_ip: this.userData.ip,
                nda_method: this.selectedMethod,
                device_info: this.userData,
                idea_titolo: idea || null
            };

            // Salva in DB (o localStorage se offline)
            if (supabase) {
                const { data, error } = await DB.create('utenti', userData);
                if (error) throw error;
                Storage.set('user_id', data[0].id);
            } else {
                Storage.set('user_temp', userData);
            }

            Storage.set('nda_signed', true);
            Storage.set('user_email', email);

            Logger.info('NDA signed', { email, method: this.selectedMethod });

            // Invia OTP
            if (this.selectedMethod === 'otp-email') {
                await this.sendOTPEmail(email);
            } else {
                await this.sendOTPSMS(telefono);
            }

            // Mostra successo
            document.getElementById('nda-sign').style.display = 'none';
            document.getElementById('nda-document').style.display = 'none';
            document.getElementById('nda-success').classList.add('active');

            UI.toast('NDA firmato con successo!', 'success');

        } catch (error) {
            Logger.error('NDA signing error', error);
            UI.toast('Errore durante la firma. Riprova.', 'error');
        } finally {
            Utils.setLoading(btn, false);
        }
    },

    async sendOTPEmail(email) {
        // Simula invio OTP (in produzione: Supabase Auth o servizio email)
        Logger.info('OTP email sent', { email });
        // In produzione: await supabase.auth.signInWithOtp({ email });
    },

    async sendOTPSMS(phone) {
        // Simula invio OTP (in produzione: Twilio o servizio SMS)
        Logger.info('OTP SMS sent', { phone });
        // In produzione: await supabase.auth.signInWithOtp({ phone });
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    NDABot.init();
});
