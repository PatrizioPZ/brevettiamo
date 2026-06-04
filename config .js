// ============================================================
// BREVETTIAMO — CONFIGURAZIONE CENTRALIZZATA
// Versione con LemonSqueezy placeholder
// ============================================================

const CONFIG = {
    SUPABASE_URL: 'https://jtekrvlmqnluvaiapmwb.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_p9WH85YPfwtaKp4tfcDwug_Q9duausk',
    SITE_URL: 'https://patrizioz.github.io/brevettiamo',
    VERSION: '1.0.1',
    PREZZO_PRATICA: 300,
    PREZZO_ABBONAMENTO: 299,

    // PAGAMENTI — LEMONSQUEEZY (placeholder, attivare dopo verifica CIE)
    LEMONSQUEEZY: {
        ATTIVO: false, // CAMBIA IN true DOPO VERIFICA CIE
        API_KEY: null, // INSERISCI CHIAVE API DOPO REGISTRAZIONE
        STORE_ID: null, // INSERISCI STORE ID
        VARIANTE_PRATICA: null, // ID prodotto "Brevetto singolo €300"
        VARIANTE_ABBONAMENTO: null, // ID prodotto "Abbonamento €299/mese"
        WEBHOOK_SECRET: null // PER VERIFICA PAGAMENTI (opzionale)
    },

    // Fallback: se LemonSqueezy non attivo, mostra messaggio attesa
    PAGAMENTI_ATTIVI: false // CAMBIA IN true quando LemonSqueezy è pronto
};

// ============================================================
// SUPABASE
// ============================================================
if (typeof window.supabaseClient === 'undefined') {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        window.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    } else {
        console.error('ERRORE: Libreria Supabase non caricata');
    }
}

var supabase = window.supabaseClient;

// ============================================================
// HELPER
// ============================================================
function mostraAlert(messaggio, tipo) {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = messaggio;
        alert.className = 'alert alert-' + tipo;
        alert.classList.add('show');
        setTimeout(() => alert.classList.remove('show'), 3000);
    }
}

function getStatoClass(stato) {
    const map = {
        'bozza': 'badge-bozza',
        'in_attesa': 'badge-attesa',
        'completata': 'badge-completata',
        'attiva': 'badge-attiva',
        'fallita': 'badge-fallita'
    };
    return map[stato] || 'badge-default';
}

function getStatoLabel(stato) {
    const map = {
        'bozza': 'In Bozza',
        'in_attesa': 'In Attesa',
        'completata': 'Completata',
        'attiva': 'Attiva',
        'fallita': 'Fallita'
    };
    return map[stato] || stato;
}

function formattaData(data) {
    return data ? new Date(data).toLocaleDateString('it-IT') : 'N/D';
}

// ============================================================
// CHECK PAGAMENTI ATTIVI
// ============================================================
function pagamentiAttivi() {
    return CONFIG.LEMONSQUEEZY.ATTIVO === true && 
           CONFIG.LEMONSQUEEZY.API_KEY !== null &&
           CONFIG.LEMONSQUEEZY.STORE_ID !== null;
}
