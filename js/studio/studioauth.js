/* ============================================
   BREVETTIAMO — StudioAuth
   Autenticazione studi legali IP
   ============================================ */

const StudioAuth = {
    init() {
        this.setupForm();
    },

    setupForm() {
        const form = document.getElementById('studio-login-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form);
        });
    },

    async handleLogin(form) {
        const email = document.getElementById('studio-email').value;
        const password = document.getElementById('studio-password').value;
        const code = document.getElementById('studio-code').value;

        if (!email || !password) {
            UI.toast('Compila email e password', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        Utils.setLoading(btn, true);

        try {
            // Verifica credenziali studio (in produzione: Supabase Auth con ruolo studio)
            const studioData = {
                email,
                code: code || 'STU-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
                plan: 'basic',
                omaggiRimasti: 1,
                praticheSuccessive: 0
            };

            Storage.set('studio_session', studioData);
            Storage.set('studio_logged_in', true);

            Logger.info('Studio logged in', { email, plan: studioData.plan });

            UI.toast('Benvenuto Studio!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            Logger.error('Studio login error', error);
            UI.toast('Errore di accesso. Verifica credenziali.', 'error');
        } finally {
            Utils.setLoading(btn, false);
        }
    },

    isLoggedIn() {
        return !!Storage.get('studio_logged_in');
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    logout() {
        Storage.remove('studio_session');
        Storage.remove('studio_logged_in');
        window.location.href = 'login.html';
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    StudioAuth.init();
});
