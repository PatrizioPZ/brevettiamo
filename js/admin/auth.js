/* ============================================
   BREVETTIAMO — AdminAuth
   Autenticazione pannello admin
   ============================================ */

const AdminAuth = {
    adminHash: null, // In produzione: hash sicuro

    init() {
        this.setupForm();
        this.detectIP();
    },

    setupForm() {
        const form = document.getElementById('admin-login-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },

    async handleLogin() {
        const user = document.getElementById('admin-user').value;
        const password = document.getElementById('admin-password').value;
        const tfa = document.getElementById('admin-2fa').value;

        // In produzione: verifica contro Supabase Auth con ruolo admin
        // Per demo: credenziali hardcoded (DA CAMBIARE IN PRODUZIONE!)
        if (user === 'admin' && password === 'brevettiamo2026') {
            Storage.set('admin_session', {
                user,
                loginTime: new Date().toISOString(),
                ip: document.getElementById('admin-ip').textContent
            });

            Logger.info('Admin logged in', { user });
            UI.toast('Accesso admin consentito', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            Logger.error('Admin login failed', { user });
            UI.toast('Credenziali non valide', 'error');
        }
    },

    detectIP() {
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                document.getElementById('admin-ip').textContent = data.ip;
            })
            .catch(() => {
                document.getElementById('admin-ip').textContent = 'unknown';
            });
    },

    isLoggedIn() {
        return !!Storage.get('admin_session');
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    logout() {
        Storage.remove('admin_session');
        window.location.href = 'index.html';
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.init();
});
