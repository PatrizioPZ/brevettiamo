/* ============================================
   BREVETTIAMO — Core JavaScript
   Supabase client, utilities, logging
   ============================================ */

// ============================================
// CONFIGURAZIONE (da sostituire con tue API keys)
// ============================================
const CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
    STRIPE_PUBLIC_KEY: 'pk_test_your_key',
    LEMON_SWITCH_KEY: 'your-lemon-key',
    FORMSPREE_ID: 'your-formspree-id',
    APP_VERSION: '1.0.0',
    ENV: 'development' // 'production' per live
};

// ============================================
// SUPABASE CLIENT
// ============================================
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log('✅ Supabase inizializzato');
    } else {
        console.warn('⚠️ Supabase non caricato');
    }
}

// ============================================
// AUTH & SESSION
// ============================================
const Auth = {
    async getUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async getSession() {
        if (!supabase) return null;
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        localStorage.removeItem('brevettiamo_session');
        window.location.href = 'index.html';
    },

    isLoggedIn() {
        return !!localStorage.getItem('brevettiamo_session');
    },

    requireAuth(redirectUrl = null) {
        if (!this.isLoggedIn()) {
            const redirect = redirectUrl || window.location.pathname;
            window.location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
            return false;
        }
        return true;
    }
};

// ============================================
// DATABASE OPERATIONS
// ============================================
const DB = {
    async create(table, data) {
        if (!supabase) return { error: 'Supabase non disponibile' };
        const { data: result, error } = await supabase.from(table).insert(data).select();
        return { data: result, error };
    },

    async read(table, query = {}) {
        if (!supabase) return { error: 'Supabase non disponibile' };
        let q = supabase.from(table).select('*');
        if (query.eq) q = q.eq(query.eq.column, query.eq.value);
        if (query.order) q = q.order(query.order.column, { ascending: query.order.asc });
        if (query.limit) q = q.limit(query.limit);
        const { data, error } = await q;
        return { data, error };
    },

    async update(table, id, data) {
        if (!supabase) return { error: 'Supabase non disponibile' };
        const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
        return { data: result, error };
    },

    async delete(table, id) {
        if (!supabase) return { error: 'Supabase non disponibile' };
        const { error } = await supabase.from(table).delete().eq('id', id);
        return { error };
    }
};

// ============================================
// STORAGE (localStorage + session)
// ============================================
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(`brevettiamo_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`brevettiamo_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(`brevettiamo_${key}`);
    },

    clear() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('brevettiamo_'));
        keys.forEach(k => localStorage.removeItem(k));
    },

    // Sessione pratica corrente
    setPratica(pratica) {
        this.set('pratica_corrente', pratica);
    },

    getPratica() {
        return this.get('pratica_corrente');
    },

    clearPratica() {
        this.remove('pratica_corrente');
    }
};

// ============================================
// UTILITIES
// ============================================
const Utils = {
    // Formatta data
    formatDate(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return format.replace('DD', day).replace('MM', month).replace('YYYY', year);
    },

    // Genera UUID semplice
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Sanitizza input
    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Validazione email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Debounce
    debounce(fn, ms) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), ms);
        };
    },

    // Throttle
    throttle(fn, ms) {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= ms) {
                last = now;
                fn(...args);
            }
        };
    },

    // Copia negli appunti
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            console.error('Copy failed:', e);
            return false;
        }
    },

    // Download blob
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Scroll smooth
    scrollTo(element, offset = 80) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    },

    // Loading spinner
    setLoading(element, loading = true) {
        if (loading) {
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<span class="spinner"></span> Caricamento...';
            element.disabled = true;
        } else {
            element.innerHTML = element.dataset.originalText || element.innerHTML;
            element.disabled = false;
        }
    }
};

// ============================================
// LOGGING
// ============================================
const Logger = {
    logs: [],

    log(level, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        this.logs.push(entry);

        if (CONFIG.ENV === 'development') {
            console.log(`[${level}] ${message}`, data || '');
        }

        // In produzione, invia a Supabase
        if (CONFIG.ENV === 'production' && supabase) {
            supabase.from('logs').insert(entry).catch(() => {});
        }
    },

    info(message, data) { this.log('info', message, data); },
    warn(message, data) { this.log('warn', message, data); },
    error(message, data) { this.log('error', message, data); },

    getLogs() {
        return this.logs;
    },

    clear() {
        this.logs = [];
    }
};

// ============================================
// UI COMPONENTS
// ============================================
const UI = {
    // Toast notification
    toast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: ${type === 'error' ? '#F44336' : type === 'success' ? '#00C853' : '#003366'};
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Modal
    modal(title, content, onClose = null) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.modal-close').onclick = () => {
            overlay.remove();
            if (onClose) onClose();
        };
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onClose) onClose();
            }
        };
    },

    // Confirm dialog
    confirm(message, onConfirm, onCancel = null) {
        this.modal('Conferma', `
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-outline" id="cancel-btn">Annulla</button>
                <button class="btn btn-primary" id="confirm-btn">Conferma</button>
            </div>
        `, onCancel);

        document.getElementById('confirm-btn').onclick = () => {
            document.querySelector('.modal-overlay').remove();
            onConfirm();
        };
        document.getElementById('cancel-btn').onclick = () => {
            document.querySelector('.modal-overlay').remove();
            if (onCancel) onCancel();
        };
    }
};

// ============================================
// ANIMATIONS CSS (injected)
// ============================================
const animationCSS = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
    }
    .modal {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }
    .modal-header h3 { margin: 0; }
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }
    .modal-body { padding: 1.5rem; }
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }
`;

// Inject animation styles
const style = document.createElement('style');
style.textContent = animationCSS;
document.head.appendChild(style);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    Logger.info('App initialized', { version: CONFIG.APP_VERSION });

    // Mobile menu toggle
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
        });
    }
});

// ============================================
// EXPORTS (per moduli)
// ============================================
window.Brevettiamo = {
    CONFIG,
    Auth,
    DB,
    Storage,
    Utils,
    Logger,
    UI
};
