// ============================================================
// BREVETTIAMO — CONFIGURAZIONE CENTRALIZZATA
// Modifica solo qui, tutti i file usano queste variabili
// ============================================================

const CONFIG = {
    SUPABASE_URL: 'https://jtekrvlmqnluvaiapmwb.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_p9WH85YPfwtaKp4tfcDwug_Q9duausk',
    SITE_URL: 'https://patriziopz.github.io/brevettiamo',
    VERSION: '1.0.1',
    PREZZO_PRATICA: 300,
    PREZZO_ABBONAMENTO: 299
};

// Inizializza Supabase
let supabase;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
} else {
    console.error('ERRORE: Libreria Supabase non caricata');
}

// Helper alert
function mostraAlert(messaggio, tipo) {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = messaggio;
        alert.className = 'alert alert-' + tipo;
        alert.classList.add('show');
        setTimeout(() => alert.classList.remove('show'), 3000);
    }
}

// Helper stato
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

// Helper data
function formattaData(data) {
    return data ? new Date(data).toLocaleDateString('it-IT') : 'N/D';
}
