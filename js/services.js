// js/services.js - Generazione servizi BrevettIAmo con tooltip

const SERVIZI = [
    {
        id: 'servizio-deposito',
        nome: 'Deposito Brevetto',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: "Preparazione e deposito completo presso l'UIBM. Documentazione tecnica, rivendicazioni e tavole incluse.",
        affidabilita: 85,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '85% - Alta',
        risparmio: '-70% (mercato: 1.000-3.000)',
        prezzo: '299',
        prezzoNote: '/primo deposito',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-priorart',
        nome: 'Ricerca Prior Art',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Ricerca completa in database mondiali per verificare la novita della tua invenzione prima del deposito.',
        affidabilita: 80,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '80% - Alta',
        risparmio: '-60% (mercato: 500-1.500)',
        prezzo: '199',
        prezzoNote: '/ricerca',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-rivendicazioni',
        nome: 'Rivendicazioni',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Redazione professionale delle rivendicazioni brevettuali. La parte piu importante del tuo brevetto.',
        affidabilita: 75,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '75% - Media-Alta',
        risparmio: '-65% (mercato: 400-1.200)',
        prezzo: '149',
        prezzoNote: '/set rivendicazioni',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-tavole',
        nome: 'Tavole Tecniche',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Disegni tecnici professionali in formato SVG. Pronti per UIBM, pubblicazioni e presentazioni.',
        affidabilita: 70,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '70% - Media',
        risparmio: '-75% (mercato: 300-800)',
        prezzo: 'Incluso',
        prezzoNote: "in L'OCCHIO",
        cta: 'Inizia Ora',
        ctaLink: 'regista/index.html?servizio=servizio-tavole',
        ctaDisabled: false
    },
    {
        id: 'servizio-monitoraggio',
        nome: 'Monitoraggio',
        status: 'SOSPESO',
        statusClass: 'status-suspended',
        desc: 'Monitoraggio scadenze, rinnovi, opposizioni e concorrenti. Alert automatici via email e SMS.',
        affidabilita: 65,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '65% - Media',
        risparmio: '-50% (mercato: 200-500/anno)',
        prezzo: '99',
        prezzoNote: '/anno',
        cta: 'Prossimamente',
        ctaLink: '#',
        ctaDisabled: true
    },
    {
        id: 'servizio-priorart-base',
        nome: 'Ricerca Prior Art Base',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Ricerca essenziale nelle banche dati principali (EP, US, WO) per verificare la novita della tua invenzione.',
        affidabilita: 75,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '75% - Media-Alta',
        risparmio: '-80% (mercato: 75-150)',
        prezzo: '15',
        prezzoNote: '/ricerca',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-priorart-avanzata',
        nome: 'Ricerca Prior Art Avanzata',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Ricerca approfondita in 15+ banche dati globali. Include analisi di famiglie brevettuali e mappa concorrenti.',
        affidabilita: 80,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '80% - Alta',
        risparmio: '-75% (mercato: 90-300)',
        prezzo: '23',
        prezzoNote: '/ricerca',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-analisi-brevettabilita',
        nome: 'Analisi Brevettabilita',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Valutazione completa sui 3 criteri legali: novita, attivita inventiva, applicabilita industriale.',
        affidabilita: 78,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '78% - Media-Alta',
        risparmio: '-70% (mercato: 60-200)',
        prezzo: '18',
        prezzoNote: '/analisi',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-claims-base',
        nome: 'Redazione Claims Base',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Redazione delle rivendicazioni principali (indipendenti) per definire il campo di protezione del tuo brevetto.',
        affidabilita: 72,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '72% - Media',
        risparmio: '-75% (mercato: 90-300)',
        prezzo: '23',
        prezzoNote: '/claims',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-claims-pro',
        nome: 'Redazione Claims Pro',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Redazione completa di rivendicazioni indipendenti + dipendenti. Strategia di protezione gerarchica.',
        affidabilita: 82,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '82% - Alta',
        risparmio: '-70% (mercato: 150-500)',
        prezzo: '47',
        prezzoNote: '/claims',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-traduzione-claims',
        nome: 'Traduzione Claims',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Traduzione professionale delle rivendicazioni in inglese, francese, tedesco o spagnolo. Certificata per depositi internazionali.',
        affidabilita: 88,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '88% - Alta',
        risparmio: '-80% (mercato: 70-250)',
        prezzo: '14',
        prezzoNote: '/traduzione',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-monitoraggio-concorrenza',
        nome: 'Monitoraggio Concorrenza',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Sorveglianza attiva dei brevetti dei concorrenti in 5 settori tecnologici. Alert automatici via email.',
        affidabilita: 70,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '70% - Media',
        risparmio: '-65% (mercato: 100-350)',
        prezzo: '35',
        prezzoNote: '/mese',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-consulenza',
        nome: 'Consulenza 1:1',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Sessione video 30 min con un esperto brevettuale. Domande, strategia, dubbi, next steps.',
        affidabilita: 90,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '90% - Alta',
        risparmio: '-60% (mercato: 150-400)',
        prezzo: '59',
        prezzoNote: '/sessione',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-analisi-tecnica',
        nome: 'Analisi Tecnica',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Valutazione tecnica approfondita della tua invenzione. Analisi di fattibilita e benchmark tecnologico.',
        affidabilita: 76,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '76% - Media-Alta',
        risparmio: '-70% (mercato: 100-300)',
        prezzo: '29',
        prezzoNote: '/analisi',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-ricerca-figurativa',
        nome: 'Ricerca Figurativa',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Ricerca di design e marchi simili alla tua invenzione. Include banche dati figurative EUIPO, USPTO, WIPO.',
        affidabilita: 74,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '74% - Media',
        risparmio: '-75% (mercato: 90-300)',
        prezzo: '23',
        prezzoNote: '/ricerca',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-analisi-nullita',
        nome: 'Analisi Nullita',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Valutazione della validita di un brevetto esistente. Ricerca di elementi che potrebbero invalidare un brevetto concorrente.',
        affidabilita: 73,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '73% - Media',
        risparmio: '-65% (mercato: 100-350)',
        prezzo: '35',
        prezzoNote: '/analisi',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-opposizione',
        nome: 'Preparazione Opposizione',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Preparazione completa di un opposizione a brevetto. Raccolta prove, redazione argomentazioni, e presentazione all UIBM.',
        affidabilita: 79,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '79% - Media-Alta',
        risparmio: '-70% (mercato: 150-500)',
        prezzo: '47',
        prezzoNote: '/opposizione',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-licensing',
        nome: 'Strategia Licensing',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Analisi delle opportunita di licenza per il tuo brevetto. Mappa dei potenziali licensee e bozza contratto.',
        affidabilita: 77,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '77% - Media-Alta',
        risparmio: '-60% (mercato: 150-400)',
        prezzo: '59',
        prezzoNote: '/strategia',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-valorizzazione',
        nome: 'Valorizzazione Brevetto',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Valutazione economica del tuo brevetto. Metodi: costo, mercato, reddito. Report per investitori o cessione.',
        affidabilita: 81,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '81% - Alta',
        risparmio: '-65% (mercato: 300-1.000)',
        prezzo: '99',
        prezzoNote: '/valutazione',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-due-diligence',
        nome: 'Due Diligence IP',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Analisi completa del portfolio IP di un azienda target. Per M&A, investimenti, o partnership.',
        affidabilita: 83,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '83% - Alta',
        risparmio: '-70% (mercato: 500-1.500)',
        prezzo: '149',
        prezzoNote: '/due-diligence',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-freedom-to-operate',
        nome: 'Freedom to Operate',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Verifica che il tuo prodotto non violi brevetti esistenti. Ricerca in banche dati mondiali + analisi legale.',
        affidabilita: 78,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '78% - Media-Alta',
        risparmio: '-60% (mercato: 200-600)',
        prezzo: '79',
        prezzoNote: '/analisi',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-patentability',
        nome: 'Patentability Search',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Ricerca brevettuale in stile americano. Focus su prior art in inglese. Include analisi di citazioni e famiglie brevettuali.',
        affidabilita: 76,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '76% - Media-Alta',
        risparmio: '-75% (mercato: 70-250)',
        prezzo: '18',
        prezzoNote: '/ricerca',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-landscape',
        nome: 'Landscape Analysis',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Mappa tecnologica completa di un settore. Trend, concorrenti, white spaces, e opportunita. Report strategico 50+ pagine.',
        affidabilita: 80,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '80% - Alta',
        risparmio: '-65% (mercato: 150-500)',
        prezzo: '59',
        prezzoNote: '/analisi',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    },
    {
        id: 'servizio-cad',
        nome: 'Disegno CAD Professionale',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Creazione di disegni tecnici CAD 2D/3D per brevetti. Formati: DWG, STEP, IGES. Pronti per UIBM e produzione.',
        affidabilita: 85,
        affidabilitaClass: 'reliability-high',
        affidabilitaText: '85% - Alta',
        risparmio: '-60% (mercato: 250-750)',
        prezzo: '99',
        prezzoNote: '/disegno',
        cta: 'Inizia Ora',
        ctaLink: 'regista/index.html?servizio=servizio-cad',
        ctaDisabled: false
    },
    {
        id: 'servizio-legale-base',
        nome: 'Supporto Legale Base',
        status: 'BETA',
        statusClass: 'status-beta',
        desc: 'Consulenza legale su contratti IP (NDA, licenze, cessioni). Revisione di 1 contratto. Note e raccomandazioni.',
        affidabilita: 75,
        affidabilitaClass: 'reliability-medium',
        affidabilitaText: '75% - Media-Alta',
        risparmio: '-70% (mercato: 130-450)',
        prezzo: '39',
        prezzoNote: '/consulenza',
        cta: 'Inizia Ora',
        ctaLink: 'welcome.html',
        ctaDisabled: false
    }
];

function generaServizi() {
    const container = document.getElementById('services-grid');
    if (!container) {
        console.error('Container services-grid non trovato');
        return;
    }

    let html = '';

    SERVIZI.forEach(servizio => {
        const btnClass = servizio.cta === 'Prossimamente' ? 'btn' : 'btn btn-primary';
        const btnAttr = servizio.cta === 'Prossimamente' ? 'disabled' : '';

        // Link con parametro servizio per il flusso
        const linkFlusso = servizio.cta === 'Prossimamente' 
            ? '#' 
            : 'welcome.html?servizio=' + encodeURIComponent(servizio.id);

        html += `
            <div class="service-card" data-tooltip-id="${servizio.id}" data-servizio-id="${servizio.id}">
                <div class="service-header">
                    <div class="service-name">${servizio.nome}</div>
                    <span class="service-status ${servizio.statusClass}">${servizio.status}</span>
                </div>
                <p class="service-desc">${servizio.desc}</p>
                <div class="service-reliability">
                    <div class="reliability-label">Affidabilita AI</div>
                    <div class="reliability-bar"><div class="reliability-fill ${servizio.affidabilitaClass}" style="width: ${servizio.affidabilita}%"></div></div>
                    <div class="reliability-text">${servizio.affidabilitaText}</div>
                </div>
                <div class="service-savings">
                    <div class="savings-label">Risparmio vs Mercato</div>
                    <div class="savings-value">${servizio.risparmio}</div>
                </div>
                <div class="service-price">
                    ${servizio.prezzo} <span class="price-note">${servizio.prezzoNote}</span>
                </div>
                <div class="service-cta">
                    ${servizio.cta === 'Prossimamente'
                        ? `<button class="${btnClass}" ${btnAttr}>${servizio.cta}</button>`
                        : `<a href="${linkFlusso}" class="${btnClass}">${servizio.cta}</a>`
                    }
                </div>
                <div class="service-hint">
                    <span class="hint-icon">[i]</span>
                    <span class="hint-text">Clicca per dettagli</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('Servizi generati:', SERVIZI.length);

    // Reinizializza tooltip
    if (typeof inizializzaTooltip === 'function') {
        inizializzaTooltip();
    }
}

// Inizializza quando il DOM e pronto
document.addEventListener('DOMContentLoaded', generaServizi);
