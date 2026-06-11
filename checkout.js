// BrevettIAmo - Checkout Links
// Configurazione link LemonSqueezy

const CHECKOUT_LINKS = {
    // Pacchetti (invariati)
    starter: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/starter',
    pro: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/pro',
    enterprise: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/enterprise',
    
    // Servizi singoli (+20%)
    priorArtBase: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/prior-art-base',
    priorArtAvanzata: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/prior-art-avanzata',
    analisiBrevettabilita: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/analisi-brevettabilita',
    redazioneClaimsBase: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/redazione-claims-base',
    redazioneClaimsPro: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/redazione-claims-pro',
    traduzioneClaims: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/traduzione-claims',
    monitoraggioConcorrenza: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/monitoraggio-concorrenza',
    consulenza1on1: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/consulenza-1on1',
    
    // Abbonamenti (+20%)
    abbonamentoBasic: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/abbonamento-basic',
    abbonamentoPro: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/abbonamento-pro',
    abbonamentoUnlimited: 'https://brevettiamo.lemonsqueezy.com/checkout/buy/abbonamento-unlimited'
};

// Funzione per reindirizzamento checkout
function checkout(product) {
    const link = CHECKOUT_LINKS[product];
    if (link) {
        window.open(link, '_blank');
    } else {
        console.error('Prodotto non trovato:', product);
        alert('Checkout non disponibile per questo prodotto.');
    }
}

// Esporta per uso nei file HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHECKOUT_LINKS, checkout };
}
