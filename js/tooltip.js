/* ============================================================
   TOOLTIP.JS v2.0 - BrevettIAmo
   Tooltip light con espansione al click
   ============================================================ */

let TOOLTIP_TESTI = {};
let tooltipAttivo = null;

// ============================================================
// CARICAMENTO DATI
// ============================================================

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
        'servizio-deposito': { light: 'Deposito Brevetto: da €299 — Risparmio -70%', full: 'Deposito completo presso l\'UIBM.' },
        'servizio-priorart': { light: 'Ricerca Prior Art: da €199 — Risparmio -60%', full: 'Ricerca in database mondiali.' },
        'servizio-rivendicazioni': { light: 'Rivendicazioni: da €149 — Risparmio -65%', full: 'Redazione rivendicazioni brevettuali.' },
        'servizio-tavole': { light: 'Tavole Tecniche: Incluso in L\'OCCHIO — Risparmio -75%', full: 'Disegni tecnici SVG professionali.' },
        'servizio-monitoraggio': { light: 'Monitoraggio: €99/anno — Risparmio -50%', full: 'Alert scadenze e concorrenti.' }
    };
    inizializzaTooltip();
}

// ============================================================
// INIZIALIZZAZIONE TOOLTIP
// ============================================================

function inizializzaTooltip() {
    document.querySelectorAll('[data-tooltip-id]').forEach(element => {
        const id = element.getAttribute('data-tooltip-id');
        const dati = TOOLTIP_TESTI[id];
        if (dati) {
            // Usa la versione light per il tooltip hover
            element.setAttribute('data-tooltip', dati.light || dati);
            // Aggiungi handler per espansione al click
            element.addEventListener('click', (e) => {
                // Se il click e su un link o button, non aprire il modale
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                    return;
                }
                apriTooltipModale(id, dati.full || dati);
            });
        }
    });
}

// ============================================================
// MODALE TOOLTIP ESPANSO
// ============================================================

function apriTooltipModale(id, testo) {
    // Chiudi modale esistente
    chiudiTooltipModale();

    // Crea overlay
    const overlay = document.createElement('div');
    overlay.id = 'tooltip-modal-overlay';
    overlay.className = 'tooltip-modal-overlay';
    overlay.addEventListener('click', chiudiTooltipModale);

    // Crea contenuto modale
    const modal = document.createElement('div');
    modal.id = 'tooltip-modal';
    modal.className = 'tooltip-modal';

    // Formatta il testo (converte markdown tabella in HTML)
    const htmlContent = formattaTooltipTesto(testo);

    modal.innerHTML = `
        <div class="tooltip-modal-header">
            <span class="tooltip-modal-title">Dettaglio Servizio</span>
            <button class="tooltip-modal-close" onclick="chiudiTooltipModale()">&times;</button>
        </div>
        <div class="tooltip-modal-body">
            ${htmlContent}
        </div>
        <div class="tooltip-modal-footer">
            <button class="tooltip-modal-btn" onclick="chiudiTooltipModale()">Chiudi</button>
            <a href="welcome.html" class="tooltip-modal-btn tooltip-modal-btn-primary">Inizia Ora</a>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    tooltipAttivo = { overlay, modal };

    // Animazione apertura
    requestAnimationFrame(() => {
        overlay.classList.add('tooltip-modal-active');
        modal.classList.add('tooltip-modal-active');
    });

    // Chiudi con ESC
    document.addEventListener('keydown', chiudiTooltipEsc);
}

function chiudiTooltipModale() {
    if (!tooltipAttivo) return;
    const { overlay, modal } = tooltipAttivo;

    overlay.classList.remove('tooltip-modal-active');
    modal.classList.remove('tooltip-modal-active');

    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        tooltipAttivo = null;
    }, 250);

    document.removeEventListener('keydown', chiudiTooltipEsc);
}

function chiudiTooltipEsc(e) {
    if (e.key === 'Escape') chiudiTooltipModale();
}

// ============================================================
// FORMATTAZIONE TESTO MARKDOWN -> HTML
// ============================================================

function formattaTooltipTesto(testo) {
    let html = testo;

    // Titolo (prima riga)
    html = html.replace(/^([^
]+)/, '<h3 class="tooltip-modal-h3">$1</h3>');

    // Paragrafi vuoti -> <br>
    html = html.replace(/

/g, '</p><p>');
    html = html.replace(/
/g, '<br>');

    // Liste numerate
    html = html.replace(/(\d+)\.\s+([^<]+)/g, '<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol class="tooltip-modal-ol">$1</ol>');

    // Liste puntate
    html = html.replace(/-\s+([^<]+)/g, '<li>$1</li>');
    html = html.replace(/(<li>[^<]+<\/li>)/s, '<ul class="tooltip-modal-ul">$1</ul>');

    // Tabelle markdown
    html = html.replace(/\|([^|]+)\|([^|]+)\|/g, (match, c1, c2) => {
        return `<tr><td>${c1.trim()}</td><td>${c2.trim()}</td></tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table class="tooltip-modal-table">$1</table>');

    // Riga separatore tabella
    html = html.replace(/<tr><td>[-\s]+<\/td><td>[-\s]+<\/td><\/tr>/g, '');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Avvolgi in paragrafo se non gia fatto
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

// ============================================================
// CSS TOOLTIP (iniettato dinamicamente)
// ============================================================

function iniettaTooltipCSS() {
    if (document.getElementById('tooltip-css-v2')) return;

    const css = document.createElement('style');
    css.id = 'tooltip-css-v2';
    css.textContent = `
        /* ========== TOOLTIP HOVER (light) ========== */
        [data-tooltip] {
            position: relative;
            cursor: help;
        }

        [data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%) scale(0.95);
            background: #f5f0e6;
            color: #3d2b1f;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-line;
            max-width: 280px;
            width: max-content;
            box-shadow: 0 4px 20px rgba(61, 43, 31, 0.25);
            border: 1px solid #c9a96e;
            opacity: 0;
            visibility: hidden;
            transition: all 0.25s ease;
            z-index: 1000;
            pointer-events: none;
        }

        [data-tooltip]::before {
            content: '';
            position: absolute;
            bottom: calc(100% + 4px);
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: #c9a96e;
            opacity: 0;
            visibility: hidden;
            transition: all 0.25s ease;
            z-index: 1000;
            pointer-events: none;
        }

        [data-tooltip]:hover::after,
        [data-tooltip]:hover::before {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) scale(1);
        }

        /* ========== MODALE TOOLTIP ESPANSO ========== */
        .tooltip-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(61, 43, 31, 0.6);
            backdrop-filter: blur(4px);
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .tooltip-modal-overlay.tooltip-modal-active {
            opacity: 1;
        }

        .tooltip-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: #f5f0e6;
            border: 2px solid #c9a96e;
            border-radius: 12px;
            max-width: 520px;
            width: 90vw;
            max-height: 80vh;
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(61, 43, 31, 0.4);
        }

        .tooltip-modal.tooltip-modal-active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .tooltip-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #c9a96e;
            background: #ebe3d5;
            border-radius: 10px 10px 0 0;
        }

        .tooltip-modal-title {
            font-family: 'Cinzel', serif;
            font-size: 16px;
            color: #3d2b1f;
            font-weight: 600;
        }

        .tooltip-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #8b7355;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .tooltip-modal-close:hover {
            background: #c9a96e;
            color: #f5f0e6;
        }

        .tooltip-modal-body {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
            font-size: 14px;
            line-height: 1.7;
            color: #3d2b1f;
        }

        .tooltip-modal-body h3 {
            font-family: 'Cinzel', serif;
            font-size: 15px;
            color: #8b6914;
            margin: 0 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #c9a96e;
        }

        .tooltip-modal-body p {
            margin: 0 0 10px 0;
        }

        .tooltip-modal-body ol,
        .tooltip-modal-body ul {
            margin: 8px 0;
            padding-left: 20px;
        }

        .tooltip-modal-body li {
            margin: 4px 0;
        }

        .tooltip-modal-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 13px;
        }

        .tooltip-modal-body td {
            padding: 6px 10px;
            border: 1px solid #c9a96e;
        }

        .tooltip-modal-body td:first-child {
            background: #ebe3d5;
            font-weight: 600;
            width: 45%;
        }

        .tooltip-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 14px 20px;
            border-top: 1px solid #c9a96e;
            background: #ebe3d5;
            border-radius: 0 0 10px 10px;
        }

        .tooltip-modal-btn {
            padding: 8px 18px;
            border: 1px solid #c9a96e;
            border-radius: 6px;
            background: #f5f0e6;
            color: #3d2b1f;
            font-family: 'Cinzel', serif;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }

        .tooltip-modal-btn:hover {
            background: #c9a96e;
            color: #f5f0e6;
        }

        .tooltip-modal-btn-primary {
            background: #8b6914;
            color: #f5f0e6;
            border-color: #8b6914;
        }

        .tooltip-modal-btn-primary:hover {
            background: #6b510f;
        }

        /* Scrollbar personalizzata */
        .tooltip-modal-body::-webkit-scrollbar {
            width: 6px;
        }
        .tooltip-modal-body::-webkit-scrollbar-track {
            background: #ebe3d5;
        }
        .tooltip-modal-body::-webkit-scrollbar-thumb {
            background: #c9a96e;
            border-radius: 3px;
        }

        /* Mobile */
        @media (max-width: 600px) {
            .tooltip-modal {
                max-width: 95vw;
                max-height: 85vh;
            }
            [data-tooltip]::after {
                max-width: 200px;
                font-size: 12px;
            }
        }

        /* ========== INDICATORE "Clicca per dettagli" ========== */
        .service-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            padding: 6px 0;
            border-top: 1px dashed #c9a96e;
            font-size: 11px;
            color: #8b7355;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: 0.7;
        }

        .service-hint:hover {
            opacity: 1;
            color: #8b6914;
        }

        .hint-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border: 1px solid #8b7355;
            border-radius: 50%;
            font-size: 10px;
            font-weight: bold;
            font-family: serif;
            line-height: 1;
        }

        .service-hint:hover .hint-icon {
            border-color: #8b6914;
            background: #8b6914;
            color: #f5f0e6;
        }

        .hint-text {
            font-style: italic;
            letter-spacing: 0.3px;
        }
    `;
    document.head.appendChild(css);
}

// ============================================================
// FUNZIONE UNIVERSALE: assegna tooltip ai servizi dinamici
// ============================================================

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

    inizializzaTooltip();
}

// ============================================================
// AVVIO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    iniettaTooltipCSS();
    caricaTooltipTesti('it');

    // Prima assegnazione dopo 1 secondo
    setTimeout(assegnaTooltipServizi, 1000);

    // Osserva cambiamenti nel DOM
    const observer = new MutationObserver((mutations) => {
        let serviziAggiunti = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.classList && node.classList.contains('service-card')) {
                        serviziAggiunti = true;
                    }
                    if (node.querySelector && node.querySelector('.service-card')) {
                        serviziAggiunti = true;
                    }
                }
            });
        });
        if (serviziAggiunti) {
            assegnaTooltipServizi();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
