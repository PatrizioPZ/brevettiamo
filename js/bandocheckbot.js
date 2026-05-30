/* ============================================
   BREVETTIAMO — BandoCheckBot
   Checklist documenti per domanda bando
   ============================================ */

const BandoCheckBot = {
    totalDocs: 8,
    completedDocs: 0,
    bandoId: null,

    init() {
        this.loadBandoFromURL();
        this.loadProgress();
        this.calculateCountdown();
    },

    loadBandoFromURL() {
        const params = new URLSearchParams(window.location.search);
        this.bandoId = params.get('bando') || 'voucher3i';

        // Carica dettagli bando
        const bando = BandiBot.getBandoDetails(this.bandoId);
        if (bando) {
            document.getElementById('bando-name').textContent = bando.nome;
            document.getElementById('info-importo').textContent = bando.importo;
            document.getElementById('info-copertura').textContent = bando.copertura + '% fondo perduto';
            document.getElementById('info-ente').textContent = bando.ente;
            document.getElementById('sidebar-importo').textContent = bando.importo;

            // Aggiorna requisiti
            const requisitiList = document.getElementById('requisiti-list');
            if (requisitiList && bando.requisiti) {
                requisitiList.innerHTML = bando.requisiti.map(r => `<li>${r}</li>`).join('');
            }
        }

        Logger.info('Bando loaded', { id: this.bandoId });
    },

    loadProgress() {
        // Carica progresso salvato
        const saved = Storage.get(`bando_progress_${this.bandoId}`);
        if (saved) {
            saved.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = true;
            });
            this.updateProgress();
        }
    },

    updateProgress() {
        const checkboxes = document.querySelectorAll('.checklist-item input');
        const checked = document.querySelectorAll('.checklist-item input:checked');

        this.completedDocs = checked.length;
        this.totalDocs = checkboxes.length;

        const percentage = Math.round((this.completedDocs / this.totalDocs) * 100);

        document.getElementById('checklist-progress').style.width = `${percentage}%`;
        document.getElementById('checklist-text').textContent = 
            `${this.completedDocs}/${this.totalDocs} documenti completati (${percentage}%)`;

        // Salva progresso
        const checkedIds = Array.from(checked).map(cb => cb.id);
        Storage.set(`bando_progress_${this.bandoId}`, checkedIds);

        Logger.info('Checklist progress updated', { completed: this.completedDocs, total: this.totalDocs });
    },

    calculateCountdown() {
        // Scadenza fittizia: 31/12/2026
        const deadline = new Date('2026-12-31');
        const now = new Date();
        const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        document.getElementById('countdown-days').textContent = Math.max(0, diff);
    },

    goToPortal() {
        const portals = {
            voucher3i: 'https://www.invitalia.it',
            brevettipiù: 'https://www.mise.gov.it',
            disegnipiù: 'https://www.ice.it'
        };

        const url = portals[this.bandoId] || 'https://www.invitalia.it';
        window.open(url, '_blank');

        Logger.info('Portal opened', { bando: this.bandoId, url });
    },

    requestAssistance() {
        UI.modal('Assistenza Domanda Bando', `
            <div style="text-align: center;">
                <p style="margin-bottom: 1.5rem;">Il nostro team può aiutarti a:</p>
                <ul style="text-align: left; margin-bottom: 1.5rem;">
                    <li>Compilare la domanda online</li>
                    <li>Verificare la documentazione</li>
                    <li>Preparare il progetto da presentare</li>
                    <li>Seguire l'iter fino all'erogazione</li>
                </ul>
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                    <p style="font-weight: 700; color: var(--primary);">€199 — Pacchetto "Solo Firma"</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Noi prepariamo, tu firmi e invii</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">Più tardi</button>
                    <button class="btn btn-primary" onclick="BandoCheckBot.confirmAssistance()">Richiedi</button>
                </div>
            </div>
        `);
    },

    confirmAssistance() {
        document.querySelector('.modal-overlay')?.remove();
        UI.toast('Richiesta assistenza inviata! Ti contatteremo entro 24h.', 'success');
        Logger.info('Assistance requested', { bando: this.bandoId });
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    BandoCheckBot.init();
});
