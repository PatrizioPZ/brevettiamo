let TOOLTIP_TESTI = {};

async function caricaTooltipTesti(lingua = 'it') {
    try {
        const response = await fetch('data/tooltip-testi.json');
        const data = await response.json();
        TOOLTIP_TESTI = data[lingua] || data['it'];
        inizializzaTooltip();
    } catch (error) {
        console.error('Errore caricamento tooltip:', error);
        caricaTooltipFallback();
    }
}

function caricaTooltipFallback() {
    TOOLTIP_TESTI = {
        'servizio-deposito': 'Deposito brevetto: da €299',
        'servizio-priorart': 'Ricerca prior art: da €199',
        'servizio-rivendicazioni': 'Rivendicazioni: da €149',
        'servizio-tavole': 'Tavole tecniche: su richiesta',
        'servizio-monitoraggio': 'Monitoraggio: da €99/anno',
        'occhio-wizard': 'L\'OCCHIO: da €29',
        'occhio-step1': 'Step 1: Descrivi',
        'occhio-step2': 'Step 2: Carica',
        'occhio-step3': 'Step 3: Analizza',
        'pacchetto-starter': 'Starter Pack: €599',
        'pacchetto-pro': 'Pro Pack: €999',
        'pacchetto-enterprise': 'Enterprise: su preventivo'
    };
    inizializzaTooltip();
}

function inizializzaTooltip() {
    document.querySelectorAll('[data-tooltip-id]').forEach(element => {
        const id = element.getAttribute('data-tooltip-id');
        const testo = TOOLTIP_TESTI[id];
        if (testo) {
            element.setAttribute('data-tooltip', testo);
        }
    });
}

function cambiaLinguaTooltip(lingua) {
    caricaTooltipTesti(lingua);
}

// FUNZIONE UNIVERSALE: assegna tooltip ai servizi dinamici
function assegnaTooltipServizi() {
    const servizi = document.querySelectorAll('.service-card');
    const mappaServizi = {
        'Deposito Brevetto': 'servizio-deposito',
        'Ricerca Prior Art': 'servizio-priorart',
        'Rivendicazioni': 'servizio-rivendicazioni',
        'Tavole Tecniche': 'servizio-tavole',
        'Monitoraggio': 'servizio-monitoraggio'
    };

    servizi.forEach(card => {
        const nomeElement = card.querySelector('.service-name');
        if (nomeElement) {
            const nome = nomeElement.textContent.trim();
            const tooltipId = mappaServizi[nome];
            if (tooltipId && !card.hasAttribute('data-tooltip-id')) {
                card.setAttribute('data-tooltip-id', tooltipId);
            }
        }
    });

    // Reinizializza tooltip dopo aver aggiunto gli ID
    inizializzaTooltip();
}

// Avvia al caricamento + osserva cambiamenti DOM
document.addEventListener('DOMContentLoaded', () => {
    caricaTooltipTesti('it');

    // Prima assegnazione dopo 1 secondo (per dare tempo ai servizi di caricarsi)
    setTimeout(assegnaTooltipServizi, 1000);

    // Osserva cambiamenti nel DOM per catturare servizi caricati dinamicamente
    const observer = new MutationObserver((mutations) => {
        let serviziAggiunti = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList && node.classList.contains('service-card')) {
                    serviziAggiunti = true;
                }
                if (node.nodeType === 1 && node.querySelector && node.querySelector('.service-card')) {
                    serviziAggiunti = true;
                }
            });
        });
        if (serviziAggiunti) {
            assegnaTooltipServizi();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
