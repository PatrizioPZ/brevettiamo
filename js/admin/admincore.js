/* ============================================
   BREVETTIAMO — AdminCore
   KPI, dati riassuntivi, report
   ============================================ */

const AdminCore = {
    init() {
        if (!AdminAuth.requireAuth()) return;

        this.loadKPIs();
        this.startRealTimeUpdates();
    },

    loadKPIs() {
        // Dati demo - in produzione: query Supabase
        const kpis = {
            utenti: 142,
            pratiche: 89,
            fatturato: '€24.5K',
            studios: 5
        };

        document.getElementById('kpi-utenti').textContent = kpis.utenti;
        document.getElementById('kpi-pratiche').textContent = kpis.pratiche;
        document.getElementById('kpi-fatturato').textContent = kpis.fatturato;
        document.getElementById('kpi-studios').textContent = kpis.studios;

        Logger.info('Admin KPIs loaded', kpis);
    },

    startRealTimeUpdates() {
        // In produzione: WebSocket o polling Supabase
        setInterval(() => {
            this.checkNewAlerts();
        }, 30000); // Ogni 30 secondi
    },

    checkNewAlerts() {
        // Simula check alert
        Logger.info('Alert check performed');
    },

    generateReport() {
        const report = {
            periodo: 'Maggio 2026',
            pratiche: 89,
            fatturato: 24500,
            nuoviUtenti: 18,
            conversionRate: '12.5%'
        };

        // Genera CSV/JSON
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        Utils.downloadBlob(blob, `report_${report.periodo}.json`);

        UI.toast('Report generato!', 'success');
        Logger.info('Report generated', report);
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    AdminCore.init();
});
