/* ============================================
   BREVETTIAMO — CommercialistaBot (Admin)
   Pacchetto "solo firma" per assistenza bandi
   ============================================ */

const CommercialistaBot = {
    richieste: [],

    init() {
        this.loadRichieste();
    },

    loadRichieste() {
        this.richieste = [
            {
                id: 1,
                cliente: 'Studio Rossi & Associati',
                bando: 'Voucher 3I',
                importo: 199,
                data: new Date(),
                stato: 'in attesa'
            },
            {
                id: 2,
                cliente: 'Mario Bianchi',
                bando: 'Brevetti+',
                importo: 199,
                data: new Date(Date.now() - 86400000),
                stato: 'in attesa'
            },
            {
                id: 3,
                cliente: 'Startup GreenTech',
                bando: 'Voucher 3I',
                importo: 199,
                data: new Date(Date.now() - 172800000),
                stato: 'in attesa'
            }
        ];

        Logger.info('Richieste loaded', { count: this.richieste.length });
    },

    processAll() {
        this.richieste.forEach(r => {
            r.stato = 'in lavorazione';
        });

        UI.toast(`${this.richieste.length} richieste messe in lavorazione`, 'success');
        Logger.info('All requests processed', { count: this.richieste.length });
    },

    processSingle(id) {
        const richiesta = this.richieste.find(r => r.id === id);
        if (richiesta) {
            richiesta.stato = 'completata';
            UI.toast(`Richiesta ${id} completata`, 'success');
        }
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    CommercialistaBot.init();
});
