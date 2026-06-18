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
        risparmio: '-70% (mercato: €1.000-3.000)',
        prezzo: '€299',
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
        risparmio: '-60% (mercato: €500-1.500)',
        prezzo: '€199',
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
        risparmio: '-65% (mercato: €400-1.200)',
        prezzo: '€149',
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
        risparmio: '-75% (mercato: €300-800)',
        prezzo: 'Incluso',
        prezzoNote: "in L'OCCHIO",
        cta: "Scopri L'OCCHIO",
        ctaLink: 'occhio-landing.html',
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
        risparmio: '-50% (mercato: €200-500/anno)',
        prezzo: '€99',
        prezzoNote: '/anno',
        cta: 'Disponibile prossimamente',
        ctaLink: '#',
        ctaDisabled: true
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
        const btnClass = servizio.ctaDisabled ? 'btn' : 'btn btn-primary';
        const btnAttr = servizio.ctaDisabled ? 'disabled' : '';

        html += `
            <div class="service-card" data-tooltip-id="${servizio.id}">
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
                    ${servizio.ctaDisabled 
                        ? `<button class="${btnClass}" ${btnAttr}>${servizio.cta}</button>`
                        : `<a href="${servizio.ctaLink}" class="${btnClass}">${servizio.cta}</a>`
                    }
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('Servizi generati:', SERVIZI.length);

    // Reinizializza tooltip dopo aver generato i servizi
    if (typeof inizializzaTooltip === 'function') {
        inizializzaTooltip();
    }
}

// Inizializza quando il DOM e pronto
document.addEventListener('DOMContentLoaded', generaServizi);
