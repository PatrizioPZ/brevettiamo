/* ============================================
   BREVETTIAMO — StudioCore
   Dashboard multi-cliente, KPI, fatturazione
   ============================================ */

const StudioCore = {
    clients: [],
    studioData: {},

    init() {
        if (!StudioAuth.requireAuth()) return;

        this.loadStudioData();
        this.loadClients();
        this.renderDashboard();
    },

    loadStudioData() {
        this.studioData = Storage.get('studio_session') || {
            plan: 'basic',
            nome: 'Studio Legale',
            omaggiRimasti: 1,
            praticheSuccessive: 0,
            fatturatoMese: 0
        };

        Logger.info('Studio data loaded', this.studioData);
    },

    loadClients() {
        // Clienti demo
        this.clients = [
            {
                id: 1,
                nome: 'Mario Rossi',
                iniziali: 'MR',
                pratica: 'Sistema di irrigazione',
                tipo: 'Brevetto',
                stato: 'firmato',
                importo: 0 // Omaggio
            },
            {
                id: 2,
                nome: 'Luca Bianchi',
                iniziali: 'LB',
                pratica: 'App fitness',
                tipo: 'Marchio',
                stato: 'bozza',
                importo: 69
            },
            {
                id: 3,
                nome: 'Giulia Verdi',
                iniziali: 'GV',
                pratica: 'Dispositivo medico',
                tipo: 'Brevetto',
                stato: 'pagato',
                importo: 150
            }
        ];
    },

    renderDashboard() {
        // Studio info
        document.getElementById('studio-plan').textContent = 
            this.studioData.plan.charAt(0).toUpperCase() + this.studioData.plan.slice(1);

        // KPI
        document.getElementById('kpi-clienti').textContent = this.clients.length;
        document.getElementById('kpi-pratiche').textContent = this.clients.length;
        document.getElementById('kpi-omaggi').textContent = this.studioData.omaggiRimasti;

        const fatturato = this.clients.reduce((sum, c) => sum + c.importo, 0) + 299;
        document.getElementById('kpi-fatturato').textContent = `€${fatturato}`;

        // Usage bars
        const omaggiUsati = 1 - this.studioData.omaggiRimasti;
        document.getElementById('usage-omaggi').textContent = `${omaggiUsati}/1`;
        document.getElementById('fill-omaggi').style.width = `${omaggiUsati * 100}%`;

        const pratichePagate = this.clients.filter(c => c.importo > 0).length;
        document.getElementById('usage-pratiche').textContent = `${pratichePagate}/∞`;
        document.getElementById('fill-pratiche').style.width = '10%';
    },

    addClient() {
        UI.modal('Nuovo Cliente', `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="new-client-name" placeholder="Mario Rossi">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="new-client-email" placeholder="mario@esempio.it">
            </div>
            <div class="form-group">
                <label>Tipo Pratica</label>
                <select id="new-client-type">
                    <option value="brevetto">Brevetto</option>
                    <option value="marchio">Marchio</option>
                    <option value="disegno">Disegno</option>
                    <option value="modello">Modello</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">Annulla</button>
                <button class="btn btn-primary" onclick="StudioCore.confirmAddClient()">Aggiungi</button>
            </div>
        `);
    },

    confirmAddClient() {
        const nome = document.getElementById('new-client-name').value;
        const email = document.getElementById('new-client-email').value;
        const type = document.getElementById('new-client-type').value;

        if (!nome || !email) {
            UI.toast('Compila tutti i campi', 'error');
            return;
        }

        const iniziali = nome.split(' ').map(n => n[0]).join('').toUpperCase();

        const newClient = {
            id: this.clients.length + 1,
            nome,
            iniziali,
            pratica: 'Nuova pratica',
            tipo: type,
            stato: 'bozza',
            importo: this.studioData.omaggiRimasti > 0 ? 0 : 150
        };

        if (this.studioData.omaggiRimasti > 0) {
            this.studioData.omaggiRimasti--;
        }

        this.clients.push(newClient);
        this.renderDashboard();

        document.querySelector('.modal-overlay')?.remove();
        UI.toast('Cliente aggiunto!', 'success');
        Logger.info('Client added', { nome, type });
    },

    requestWhiteLabel() {
        UI.modal('White Label', `
            <div style="text-align: center;">
                <p style="margin-bottom: 1.5rem;">Personalizza BrevettIAmo con:</p>
                <ul style="text-align: left; margin-bottom: 1.5rem;">
                    <li>Logo del tuo studio</li>
                    <li>Colori brand</li>
                    <li>Dominio personalizzato (es. brevetti.studio.it)</li>
                    <li>Email con il tuo dominio</li>
                </ul>
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                    <p style="font-weight: 700; color: var(--primary);">Disponibile in piano Pro e Enterprise</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">Più tardi</button>
                    <button class="btn btn-primary" onclick="StudioCore.upgradePlan()">Upgrade a Pro</button>
                </div>
            </div>
        `);
    },

    upgradePlan() {
        document.querySelector('.modal-overlay')?.remove();
        UI.toast('Richiesta upgrade inviata!', 'success');
        Logger.info('Plan upgrade requested');
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    StudioCore.init();
});
