/* ============================================
   BREVETTIAMO — Auth Utente
   Magic Link, OTP, Google OAuth
   ============================================ */

const AuthModule = {
    // Inizializza auth
    async init() {
        const session = await Auth.getSession();
        if (session) {
            Storage.set('brevettiamo_session', session);
            this.updateUI(session.user);
        }
        this.setupForms();
    },

    // Setup form login
    setupForms() {
        const loginForm = document.getElementById('login-form');
        const otpForm = document.getElementById('otp-form');
        const magicForm = document.getElementById('magic-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        if (otpForm) {
            otpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOTP(e.target);
            });
        }

        if (magicForm) {
            magicForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMagicLink(e.target);
            });
        }

        // Google OAuth button
        const googleBtn = document.getElementById('google-auth');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleAuth());
        }
    },

    // Login con email + password (o registrazione)
    async handleLogin(form) {
        const email = form.querySelector('[name="email"]').value;
        const password = form.querySelector('[name="password"]').value;
        const isRegister = form.dataset.mode === 'register';

        if (!Utils.isValidEmail(email)) {
            UI.toast('Inserisci un email valida', 'error');
            return;
        }

        if (password.length < 8) {
            UI.toast('Password minimo 8 caratteri', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        Utils.setLoading(btn, true);

        try {
            let result;
            if (isRegister) {
                result = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nome: form.querySelector('[name="nome"]')?.value || '',
                            cognome: form.querySelector('[name="cognome"]')?.value || ''
                        }
                    }
                });
            } else {
                result = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
            }

            if (result.error) throw result.error;

            Storage.set('brevettiamo_session', result.data.session);
            Logger.info(isRegister ? 'User registered' : 'User logged in', { email });

            UI.toast(isRegister ? 'Registrazione completata!' : 'Benvenuto!', 'success');

            // Redirect
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || 'it/nda.html';
            setTimeout(() => window.location.href = redirect, 1000);

        } catch (error) {
            Logger.error('Auth error', error);
            UI.toast(error.message || 'Errore di autenticazione', 'error');
        } finally {
            Utils.setLoading(btn, false);
        }
    },

    // Magic Link (passwordless)
    async handleMagicLink(form) {
        const email = form.querySelector('[name="email"]').value;

        if (!Utils.isValidEmail(email)) {
            UI.toast('Inserisci un email valida', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        Utils.setLoading(btn, true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/it/nda.html`
                }
            });

            if (error) throw error;

            UI.toast('Link di accesso inviato! Controlla la email.', 'success');
            Logger.info('Magic link sent', { email });

        } catch (error) {
            Logger.error('Magic link error', error);
            UI.toast(error.message, 'error');
        } finally {
            Utils.setLoading(btn, false);
        }
    },

    // OTP via SMS (per firma)
    async handleOTP(form) {
        const phone = form.querySelector('[name="phone"]').value;
        const otp = form.querySelector('[name="otp"]')?.value;

        if (!phone || phone.length < 10) {
            UI.toast('Inserisci un numero valido', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        Utils.setLoading(btn, true);

        try {
            if (!otp) {
                // Invia OTP
                const { error } = await supabase.auth.signInWithOtp({
                    phone
                });
                if (error) throw error;

                UI.toast('Codice OTP inviato!', 'success');
                // Mostra campo OTP
                document.getElementById('otp-field').style.display = 'block';

            } else {
                // Verifica OTP
                const { error } = await supabase.auth.verifyOtp({
                    phone,
                    token: otp,
                    type: 'sms'
                });
                if (error) throw error;

                UI.toast('Verifica completata!', 'success');
                // Procedi con firma
                window.dispatchEvent(new CustomEvent('otp-verified', { detail: { phone } }));
            }

        } catch (error) {
            Logger.error('OTP error', error);
            UI.toast(error.message, 'error');
        } finally {
            Utils.setLoading(btn, false);
        }
    },

    // Google OAuth
    async handleGoogleAuth() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/it/nda.html`
                }
            });
            if (error) throw error;
        } catch (error) {
            Logger.error('Google auth error', error);
            UI.toast('Errore Google Auth', 'error');
        }
    },

    // Logout
    async logout() {
        await Auth.signOut();
    },

    // Update UI based on auth state
    updateUI(user) {
        const authLinks = document.querySelectorAll('.auth-dependent');
        authLinks.forEach(el => {
            if (user) {
                el.classList.add('logged-in');
                el.classList.remove('logged-out');
            } else {
                el.classList.add('logged-out');
                el.classList.remove('logged-in');
            }
        });

        // Mostra nome utente se presente
        const userNameEl = document.getElementById('user-name');
        if (userNameEl && user) {
            userNameEl.textContent = user.user_metadata?.nome || user.email;
        }
    },

    // Toggle login/register mode
    toggleMode() {
        const form = document.getElementById('login-form');
        const isRegister = form.dataset.mode === 'register';
        form.dataset.mode = isRegister ? 'login' : 'register';

        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        const submitBtn = form.querySelector('button[type="submit"]');
        const toggleBtn = document.getElementById('toggle-mode');

        if (isRegister) {
            title.textContent = 'Accedi';
            subtitle.textContent = 'Bentornato su BrevettIAmo';
            submitBtn.textContent = 'Accedi';
            toggleBtn.textContent = 'Non hai un account? Registrati';
            document.getElementById('register-fields').style.display = 'none';
        } else {
            title.textContent = 'Crea Account';
            subtitle.textContent = 'Inizia a proteggere le tue idee';
            submitBtn.textContent = 'Registrati';
            toggleBtn.textContent = 'Hai già un account? Accedi';
            document.getElementById('register-fields').style.display = 'block';
        }
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
});

// Toggle mode button
document.addEventListener('click', (e) => {
    if (e.target.id === 'toggle-mode') {
        AuthModule.toggleMode();
    }
});
