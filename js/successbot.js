/* ============================================
   BREVETTIAMO — SuccessBot
   Dashboard, scadenze, alert, upgrade
   ============================================ */

const SuccessBot = {
    deadlines: [],
    alerts: [],
    pratiche: [],

    init() {
        this.loadData();
        this.renderDashboard();
        this.calculateDeadlines();
        this.startAlertSystem();
    },

    loadData() {
        this.pratiche = [
            {
                id: 1,
                titolo: Storage.get('documento_generato')?.titolo || 'Sistema di irrigazione intelligente',
                tipo: Storage.get('chat_classification')?.type || 'brevetto',
                stato: Storage.get('firma_completata') ? 'firmato' : 'pagato',
                data: new Date().toISOString(),
                importo: Storage.get('payment_service') === 'bundle' ? 400 : 300
            }
        ];

        this.user = Storage.get('user_temp') || { nome: 'Utente', email: '' };

        Logger.info('SuccessBot data loaded', { pratiche: this.pratiche.length });
    },

    renderDashboard() {
        // User info
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');
        if (userName && this.user.nome) {
            userName.textContent = `${this.user.nome} ${this.user.cognome || ''}`;
            userAvatar.textContent = this.user.nome.charAt(0).toUpperCase();
        }

        // Stats
        document.getElementById('stat-pratiche').textContent = this.pratiche.length;
        document.getElementById('stat-completate').textContent = 
            this.pratiche.filter(p => p.stato === 'depositato').length;
        document.getElementById('stat-speso').textContent = 
            `€${this.pratiche.reduce((sum, p) => sum + p.importo, 0)}`;
    },

    calculateDeadlines() {
        const now = new Date();
        const depositoDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // +15 giorni
        const tassaDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // +1 anno

        this.deadlines = [
            {
                id: 1,
                tipo: 'deposito',
                data: depositoDate,
                descrizione: 'Deposito UIBM',
                urgente: true,
                giorniRimasti: 15
            },
            {
                id: 2,
                tipo: 'tassa',
                data: tassaDate,
                descrizione: 'Tassa annuale 1° anno',
                importo: 200,
                urgente: false,
                giorniRimasti: 365
            }
        ];

        this.renderDeadlines();
        this.saveDeadlines();
    },

    renderDeadlines() {
        const container = document.getElementById('deadlines-list');
        if (!container) return;

        container.innerHTML = this.deadlines.map((dl, index) => {
            const day = dl.data.getDate();
            const month = dl.data.toLocaleString('it-IT', { month: 'short' }).toUpperCase();

            return `
                <div class="deadline-item">
                    <div class="deadline-date">
                        <div class="day">${day}</div>
                        <div class="month">${month}</div>
                    </div>
                    <div class="deadline-info">
                        <p>${dl.descrizione}</p>
                        ${dl.urgente 
                            ? `<span class="urgent">⚠️ ${dl.giorniRimasti} giorni rimasti</span>`
                            : `<span>€${dl.importo || 0}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        // Aggiorna contatore scadenze
        const urgentCount = this.deadlines.filter(d => d.urgente).length;
        document.getElementById('stat-scadenze').textContent = urgentCount;
    },

    saveDeadlines() {
        Storage.set('deadlines', this.deadlines);

        // Salva in DB
        if (supabase) {
            this.deadlines.forEach(dl => {
                DB.create('scadenze', {
                    pratica_id: Storage.get('pratica_id'),
                    tipo: dl.tipo,
                    data: dl.data.toISOString(),
                    alert_inviato: false
                }).catch(() => {});
            });
        }
    },

    startAlertSystem() {
        // Genera alert iniziali
        this.alerts = [
            {
                id: 1,
                tipo: 'fattura',
                messaggio: 'Fattura generata',
                data: new Date(),
                icon: '📧'
            },
            {
                id: 2,
                tipo: 'firma',
                messaggio: 'Documento firmato',
                data: new Date(Date.now() - 5 * 60 * 1000),
                icon: '✅'
            }
        ];

        this.renderAlerts();

        // Controlla scadenze ogni giorno
        setInterval(() => this.checkDeadlines(), 24 * 60 * 60 * 1000);
    },

    renderAlerts() {
        const container = document.getElementById('alerts-list');
        if (!container) return;

        container.innerHTML = this.alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <p>${alert.messaggio}</p>
                    <span class="date">${this.formatAlertDate(alert.data)}</span>
                </div>
            </div>
        `).join('');
    },

    formatAlertDate(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60 * 1000) return 'Adesso';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min fa`;
        if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} ore fa`;
        return date.toLocaleDateString('it-IT');
    },

    checkDeadlines() {
        const now = new Date();

        this.deadlines.forEach(dl => {
            const daysLeft = Math.ceil((dl.data - now) / (24 * 60 * 60 * 1000));

            if (daysLeft <= 7 && daysLeft > 0 && !dl.alertSent) {
                this.sendAlert(dl);
                dl.alertSent = true;
            }
        });
    },

    sendAlert(deadline) {
        const alert = {
            id: Date.now(),
            tipo: 'scadenza',
            messaggio: `Scadenza imminente: ${deadline.descrizione} (${deadline.giorniRimasti} giorni)`,
            data: new Date(),
            icon: '⏰'
        };

        this.alerts.unshift(alert);
        this.renderAlerts();

        // In produzione: invia email/SMS
        Logger.info('Deadline alert sent', deadline);
    },

    showUpgradeModal() {
        UI.modal('Assistenza Umana', `
            <div style="text-align: center;">
                <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
                    Hai bisogno di un consulente brevettuale per:
                </p>
                <ul style="text-align: left; margin-bottom: 1.5rem;">
                    <li>Revisione documento prima del deposito</li>
                    <li>Assistenza deposito UIBM</li>
                    <li>Valutazione economica brevetto</li>
                    <li>Contratti di licenza</li>
                </ul>
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                    <p style="font-weight: 700; color: var(--primary);">€100 - Video call 30min</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">€200 - Assistenza completa deposito</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">Più tardi</button>
                    <button class="btn btn-primary" onclick="SuccessBot.requestUpgrade()">Richiedi Upgrade</button>
                </div>
            </div>
        `);
    },

    requestUpgrade() {
        document.querySelector('.modal-overlay')?.remove();
        UI.toast('Richiesta upgrade inviata! Ti contatteremo entro 24h.', 'success');
        Logger.info('Upgrade requested');
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    SuccessBot.init();
});
