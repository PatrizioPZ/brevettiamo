/* ============================================
   BREVETTIAMO — BandiBot
   Match bando ottimale per azienda
   ============================================ */

const BandiBot = {
    bandi: [
        {
            id: 'voucher3i',
            nome: 'Voucher 3I',
            importo: '€1.000-4.000',
            copertura: 100,
            target: ['micro', 'piccola'],
            tipi: ['brevetto', 'marchio', 'disegno', 'modello'],
            regioni: ['tutte'],
            stato: 'aperto',
            ente: 'Invitalia / Unioncamere',
            requisiti: [
                'Micro o piccola impresa',
                'Iscrizione Registro Imprese',
                'DURC regolare',
                'Non beneficiario di altri voucher 3I nello stesso anno'
            ]
        },
        {
            id: 'brevettipiù',
            nome: 'Brevetti+',
            importo: '€50.000-140.000',
            copertura: 50,
            target: ['piccola', 'media'],
            tipi: ['brevetto', 'bundle'],
            regioni: ['tutte'],
            stato: 'aperto',
            ente: 'MISE / CDP Venture',
            requisiti: [
                'PMI o start-up innovativa',
                'Portfolio brevetti minimo 2',
                'Piano di sviluppo industriale',
                'Coerenza con PNRR'
            ]
        },
        {
            id: 'disegnipiù',
            nome: 'Disegni+ / Marchi+',
            importo: '€10.000-50.000',
            copertura: 40,
            target: ['micro', 'piccola', 'media'],
            tipi: ['disegno', 'marchio'],
            regioni: ['tutte'],
            stato: 'in-arrivo',
            ente: 'ICE / MISE',
            requisiti: [
                'PMI settore design / moda',
                'Registrazione disegni UE o marchi internazionali',
                'Piano di internazionalizzazione'
            ]
        }
    ],

    checkEligibility() {
        const size = document.getElementById('elig-size').value;
        const type = document.getElementById('elig-type').value;
        const regione = document.getElementById('elig-regione').value;

        if (!size || !type || !regione) {
            UI.toast('Compila tutti i campi', 'error');
            return;
        }

        Logger.info('Eligibility check', { size, type, regione });

        // Trova bandi compatibili
        const matches = this.bandi.filter(bando => {
            const sizeMatch = bando.target.includes(size);
            const typeMatch = bando.tipi.includes(type) || bando.tipi.includes('bundle');
            const regionMatch = bando.regioni.includes('tutte') || bando.regioni.includes(regione);
            return sizeMatch && typeMatch && regionMatch;
        });

        this.showEligibilityResult(matches, size, type);
    },

    showEligibilityResult(matches, size, type) {
        const resultEl = document.getElementById('eligibility-result');

        if (matches.length > 0) {
            const bestMatch = matches[0];
            const otherMatches = matches.slice(1);

            resultEl.className = 'eligibility-result match active';
            resultEl.innerHTML = `
                <h3>🎉 Hai diritto a ${matches.length} bando/i!</h3>
                <p><strong>Bando migliore:</strong> ${bestMatch.nome} — ${bestMatch.importo} (${bestMatch.copertura}% copertura)</p>
                <p><strong>Ente gestore:</strong> ${bestMatch.ente}</p>
                <p><strong>Stato:</strong> ${bestMatch.stato === 'aperto' ? 'Aperto — puoi presentare domanda!' : 'In arrivo'}</p>
                ${otherMatches.length > 0 ? `<p><strong>Altri bandi:</strong> ${otherMatches.map(m => m.nome).join(', ')}</p>` : ''}
                <div style="margin-top: 1rem;">
                    <a href="bando-detail.html?bando=${bestMatch.id}" class="btn btn-primary">Vai al Bando →</a>
                </div>
            `;

            Storage.set('bando_match', {
                bestMatch: bestMatch.id,
                allMatches: matches.map(m => m.id),
                userProfile: { size, type, regione }
            });
        } else {
            resultEl.className = 'eligibility-result nomatch active';
            resultEl.innerHTML = `
                <h3>⚠️ Nessun bando compatibile trovato</h3>
                <p>Con i criteri selezionati (${size}, ${type}) non risultano bandi attivi al momento.</p>
                <p><strong>Consigli:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Verifica se la tua azienda rientra in altre categorie</li>
                    <li>Controlla i bandi regionali della tua area</li>
                    <li>Monitora BrevettIAmo per nuovi bandi in arrivo</li>
                </ul>
            `;
        }

        Logger.info('Eligibility result', { matches: matches.length });
    },

    getBandoDetails(bandoId) {
        return this.bandi.find(b => b.id === bandoId);
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    Logger.info('BandiBot initialized');
});
