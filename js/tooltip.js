/* ============================================================
   TOOLTIP.JS v2.2 DEFINITIVO - BrevettIAmo
   Tooltip light con espansione al click
   ============================================================ */

let TOOLTIP_TESTI = {};
let tooltipAttivo = null;

// ============================================================
// CARICAMENTO DATI (con cache-buster)
// ============================================================

async function caricaTooltipTesti(lingua = 'it') {
    try {
        const response = await fetch('data/tooltip-testi.json?v=' + Date.now());
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
        'servizio-deposito': { light: 'Deposito Brevetto: da 299 EUR -- Risparmio -70%', full: 'Deposito completo presso UIBM.' },
        'servizio-priorart': { light: 'Ricerca Prior Art: da 199 EUR -- Risparmio -60%', full: 'Ricerca in database mondiali.' },
        'servizio-rivendicazioni': { light: 'Rivendicazioni: da 149 EUR -- Risparmio -65%', full: 'Redazione rivendicazioni brevettuali.' },
        'servizio-tavole': { light: 'Tavole Tecniche: Incluso in OCCHIO -- Risparmio -75%', full: 'Disegni tecnici SVG professionali.' },
        'servizio-monitoraggio': { light: 'Monitoraggio: 99 EUR/anno -- Risparmio -50%', full: 'Alert scadenze e concorrenti.' }
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
            element.setAttribute('data-tooltip', dati.light || dati);
            element.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                    return;
                }
                apriTooltipModale(id, dati.full || dati);
            });
        }
    });
}

// ============================================================
// PANNELLO ESPANDIBILE (toggle semplice)
// ============================================================

function apriTooltipModale(id, testo) {
    // Trova la card
    const card = document.querySelector('[data-tooltip-id="' + id + '"]');
    if (!card) return;

    // Cerca un pannello esistente nella card
    let pannello = card.querySelector('.tooltip-pannello');

    // Se il pannello esiste, chiudilo (toggle)
    if (pannello) {
        pannello.remove();
        return;
    }

    // Altrimenti, crea il pannello
    pannello = document.createElement('div');
    pannello.className = 'tooltip-pannello tooltip-pannello-attivo';
    pannello.innerHTML = formattaTooltipTesto(testo) + 
        '<div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">' +
        '<button onclick="this.parentElement.parentElement.remove()" style="padding:6px 14px; border:1px solid #c9a96e; border-radius:4px; background:#f5f0e6; color:#3d2b1f; font-family:Cinzel,serif; font-size:12px; cursor:pointer;">Chiudi</button>' +
        '<a href="welcome.html" style="padding:6px 14px; border:1px solid #8b6914; border-radius:4px; background:#8b6914; color:#f5f0e6; font-family:Cinzel,serif; font-size:12px; text-decoration:none;">Inizia Ora</a>' +
        '</div>';

    card.appendChild(pannello);
}

// Funzioni vuote per compatibilita
function chiudiTooltipModale() {
    document.querySelectorAll('.tooltip-pannello').forEach(p => p.remove());
}

function chiudiTooltipEsc(e) {
    if (e.key === 'Escape') chiudiTooltipModale();
}// ============================================================
// FORMATTAZIONE TESTO MARKDOWN -> HTML
// ============================================================

function formattaTooltipTesto(testo) {
    let html = testo;

    const primoInvio = html.indexOf('\n');
    if (primoInvio > 0) {
        const titolo = html.substring(0, primoInvio);
        const resto = html.substring(primoInvio + 2);
        html = '<h3 class="tooltip-modal-h3">' + titolo + '</h3><p>' + resto + '</p>';
    } else {
        html = '<h3 class="tooltip-modal-h3">' + html + '</h3>';
    }

    const lines = html.split('\n');
    let inOl = false;
    let inUl = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (/^\d+\.\s/.test(line)) {
            if (!inOl) {
                if (inUl) { result.push('</ul>'); inUl = false; }
                result.push('<ol class="tooltip-modal-ol">');
                inOl = true;
            }
            result.push('<li>' + line.replace(/^\d+\.\s*/, '') + '</li>');
        } else if (/^[-]\s/.test(line)) {
            if (!inUl) {
                if (inOl) { result.push('</ol>'); inOl = false; }
                result.push('<ul class="tooltip-modal-ul">');
                inUl = true;
            }
            result.push('<li>' + line.replace(/^[-]\s*/, '') + '</li>');
        } else if (/^\|?[-\s|]+\|?$/.test(line)) {
            if (inOl) { result.push('</ol>'); inOl = false; }
            if (inUl) { result.push('</ul>'); inUl = false; }
        } else if (/^\|[^|]+\|[^|]+\|$/.test(line)) {
            if (inOl) { result.push('</ol>'); inOl = false; }
            if (inUl) { result.push('</ul>'); inUl = false; }
            const cells = line.split('|').filter(c => c.trim() !== '');
            if (cells.length >= 2) {
                result.push('<table class="tooltip-modal-table"><tr><td>' + cells[0].trim() + '</td><td>' + cells[1].trim() + '</td></tr></table>');
            }
        } else {
            if (inOl) { result.push('</ol>'); inOl = false; }
            if (inUl) { result.push('</ul>'); inUl = false; }
            result.push(line);
        }
    }

    if (inOl) result.push('</ol>');
    if (inUl) result.push('</ul>');

    html = result.join('<br>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

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
        [data-tooltip] {
            position: relative;
            cursor: help;
        }
        [data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 0;
            transform: scale(0.95);
            background: #f5f0e6;
            color: #3d2b1f;
            padding: 14px 18px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-line;
            min-width: 320px;
            max-width: 400px;
            width: max-content;
            box-shadow: 0 -4px 20px rgba(61, 43, 31, 0.25);
            border: 1px solid #c9a96e;
            opacity: 0;
            visibility: hidden;
            transition: all 0.25s ease;
            z-index: 1000;
            pointer-events: none;
            text-align: left;
            margin-bottom: 4px;
        }
        [data-tooltip]::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 20px;
            transform: translateY(6px);
            border: 6px solid transparent;
            border-bottom-color: #c9a96e;
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
            transform: scale(1);
        }
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
        .tooltip-pannello {
            margin-top: 12px;
            padding: 16px;
            background: #ebe3d5;
            border: 1px solid #c9a96e;
            border-radius: 8px;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: all 0.3s ease;
            font-size: 13px;
            line-height: 1.6;
            color: #3d2b1f;
        }
        .tooltip-pannello-attivo {
            max-height: 500px;
            opacity: 1;
        }
        .tooltip-pannello h3 {
            font-family: 'Cinzel', serif;
            font-size: 14px;
            color: #8b6914;
            margin: 0 0 8px 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #c9a96e;
        }
        .tooltip-pannello p {
            margin: 0 0 8px 0;
        }
        .tooltip-pannello ol,
        .tooltip-pannello ul {
            margin: 6px 0;
            padding-left: 18px;
        }
        .tooltip-pannello li {
            margin: 3px 0;
        }
        .tooltip-pannello table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 12px;
        }
        .tooltip-pannello td {
            padding: 4px 8px;
            border: 1px solid #c9a96e;
        }
        .tooltip-pannello td:first-child {
            background: #f5f0e6;
            font-weight: 600;
            width: 45%;
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

    setTimeout(assegnaTooltipServizi, 1000);

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
