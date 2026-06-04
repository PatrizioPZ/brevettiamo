// config.js - Versione base funzionante
const SUPABASE_URL = 'https://jtekrvlmqnluvaiapmwb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_p9WH85YPfwtaKp4tfcDwug_Q9duausk';

if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var supabase = window.supabaseClient;
} else {
    console.error('ERRORE: Libreria Supabase non caricata');
}
