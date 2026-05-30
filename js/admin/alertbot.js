/* ============================================
   BREVETTIAMO — AlertBot (Admin)
   Sistema allarmi rischio civile/economico/penale
   ============================================ */

const AlertBot = {
    alerts: [],

    init() {
        if (!AdminAuth.requireAuth()) return;
        this.loadAlerts();
    },

    loadAlerts() {
        this.alerts = [
            {
                id: 1,
                tipo: 'civile',
                livello: 'danger',
                titolo: 'Rischio Civile',
                messaggio: 'Pratica #BREV-042: documento generato con score verifica 65%. Sotto soglia 80%.',
                data: new Date(),
                stato: 'aperto'
            },
            {
                id: 2,
                tipo: 'economico',
                livello: 'warning',
                titolo: 'Rischio Economico',
                messaggio: 'Studio Pro #003: omaggi esauriti, margine ridotto del 40%.',
                data: new Date(Date.now() - 3600000),
                stato: 'aperto'
            },
            {
                id: 3,
                tipo: 'penale',
                livello: 'danger',
                titolo: 'Rischio Penale',
                messaggio: 'Pratica #BREV-038: NDA non firmato correttamente. Possibile violazione GDPR.',
                data: new Date(Date.now() - 86400000),
                stato: 'aperto'
            }
        ];

        Logger.info('Alerts loaded', { count: this.alerts.length });
    },

    acknowledge(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.stato = 'acknowledged';
            UI.toast(`Alert #${alertId} acknowledged`, 'success');
            Logger.info('Alert acknowledged', { id: alertId });
        }
    },

    escalate(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.stato = 'escalated';
            UI.toast(`Alert #${alertId} escalated al team legale`, 'warning');
            Logger.warn('Alert escalated', { id: alertId, tipo: alert.tipo });
        }
    },

    checkRisks() {
        // Controlla automaticamente rischi nel sistema
        const pratiche = Storage.get('pratiche') || [];

        pratiche.forEach(p => {
            if (p.risultato_ricerca === 'rosso') {
                this.createAlert('civile', `Pratica ${p.id}: score verifica sotto soglia`);
            }
        });
    },

    createAlert(tipo, messaggio) {
        const newAlert = {
            id: Date.now(),
            tipo,
            livello: tipo === 'civile' || tipo === 'penale' ? 'danger' : 'warning',
            titolo: `Rischio ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
            messaggio,
            data: new Date(),
            stato: 'aperto'
        };

        this.alerts.push(newAlert);
        Logger.warn('New alert created', newAlert);
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    AlertBot.init();
});
