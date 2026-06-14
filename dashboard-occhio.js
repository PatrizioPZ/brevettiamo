// ============================================================
// BREVETTIAMO - dashboard-occhio.js
// Flusso completo: Click Usa -> Benvenuto Beta -> NDA -> Dettagli Servizio -> Form (con upload) -> Attiva
// ============================================================

const OCCHIO = {
    pacchetto: '',
    servizioCorrente: null,
    filesCaricati: [],
    
    init() {
        this.pacchetto = new URLSearchParams(location.search).get('pacchetto') || 'starter';
        const p = BREVETTIAMO.pacchetti[this.pacchetto] || BREVETTIAMO.pacchetti.starter;
        
        document.getElementById('pacchetto-nome').textContent = p.nome;
        document.getElementById('canali-monitorati').textContent = p.canali_allert === 'tutti' ? 'tutti' : p.canali_allert;
        
        this.caricaServizi(p);
        this.caricaAllert();
        this.caricaStatistiche();
        this.caricaScadenze();
    },
    
    caricaServizi(p) {
        const grid = document.getElementById('servizi-grid');
        grid.innerHTML = '';
        
        p.servizi_disponibili.forEach(id => {
            const s = BREVETTIAMO.servizi[id];
            if (!s) return;
            
            const div = document.createElement('div');
            div.className = 'service-card card-hover';
            div.innerHTML = 
                '<div class="flex items-start justify-between mb-3">' +
                    '<div class="flex items-center space-x-3">' +
                        '<div class="w-12 h-12 rounded-xl bg-blue-900 bg-opacity-50 flex items-center justify-center">' +
                            '<i class="fas fa-eye text-xl text-blue-400"></i>' +
                        '</div>' +
                        '<div>' +
                            '<h4 class="font-bold text-white">' + s.nome + '</h4>' +
                            '<p class="text-sm text-gray-400">' + s.descrizione + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="flex items-center justify-between mt-4">' +
                    '<div class="flex items-center space-x-2">' +
                        '<span class="w-3 h-3 rounded-full bg-green-500"></span>' +
                        '<span class="text-xs text-gray-400">L\'OCCHIO pronto</span>' +
                    '</div>' +
                    '<button onclick="OCCHIO.apriBenvenuto(\'' + id + '\')" class="btn">' +
                        '<i class="fas fa-play mr-1"></i> Usa' +
                    '</button>' +
                '</div>';
            
            grid.appendChild(div);
        });
    },
    
    // STEP 1: BENVENUTO BETA
    apriBenvenuto(id) {
        this.servizioCorrente = id;
        this.filesCaricati = [];
        const s = BREVETTIAMO.servizi[id];
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">Benvenuto in Beta!</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="close-btn">X</button>' +
                '</div>' +
                
                '<div class="step-indicator mb-6">' +
                    '<div class="step active"><span class="step-dot"></span>Benvenuto</div>' +
                    '<div class="step"><span class="step-dot"></span>NDA</div>' +
                    '<div class="step"><span class="step-dot"></span>Dettagli</div>' +
                    '<div class="step"><span class="step-dot"></span>Form</div>' +
                '</div>' +
                
                '<div class="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-4">' +
                    '<p class="text-blue-300"><i class="fas fa-gift mr-2"></i>Hai <strong>60 giorni</strong> di prova gratuita</p>' +
                    '<p class="text-blue-400 text-sm mt-2">Nessuna carta di credito richiesta</p>' +
                '</div>' +
                
                '<p class="text-gray-300 mb-2">Servizio selezionato:</p>' +
                '<p class="text-blue-400 font-bold mb-6">' + s.nome + '</p>' +
                
                '<button onclick="OCCHIO.apriNDA()" class="btn w-full py-3 text-lg font-bold">' +
                    'Continua <i class="fas fa-arrow-right ml-2"></i>' +
                '</button>' +
            '</div>';
        
        this.apriModal();
    },
    
    // STEP 2: NDA E PRIVACY
    apriNDA() {
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">NDA e Privacy</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="close-btn">X</button>' +
                '</div>' +
                
                '<div class="step-indicator mb-6">' +
                    '<div class="step completed"><span class="step-dot"></span>Benvenuto</div>' +
                    '<div class="step active"><span class="step-dot"></span>NDA</div>' +
                    '<div class="step"><span class="step-dot"></span>Dettagli</div>' +
                    '<div class="step"><span class="step-dot"></span>Form</div>' +
                '</div>' +
                
                '<div class="bg-gray-700 rounded-lg p-4 mb-4 max-h-48 overflow-auto">' +
                    '<p class="text-gray-300 text-sm"><strong>ACCORDO DI RISERVATEZZA (NDA)</strong></p>' +
                    '<p class="text-gray-400 text-sm mt-2">I dati inseriti sono protetti e crittografati. Non condividiamo informazioni con terze parti. L\'OCCHIO opera in modalita sorveglianza automatizzata. I tuoi brevetti sono protetti da accordo di riservatezza.</p>' +
                    '<p class="text-gray-400 text-sm mt-2"><strong>PRIVACY POLICY:</strong> I dati personali sono trattati in conformita al GDPR. I file caricati sono memorizzati in modo sicuro. Non vendiamo dati a terzi.</p>' +
                '</div>' +
                
                '<div class="mb-6">' +
                    '<label class="flex items-center cursor-pointer">' +
                        '<input type="checkbox" id="nda-check" class="mr-2 w-4 h-4">' +
                        '<span class="text-gray-300">Accetto i termini di NDA e Privacy Policy</span>' +
                    '</label>' +
                '</div>' +
                
                '<button onclick="OCCHIO.controllaNDA()" class="btn w-full py-3 text-lg font-bold">' +
                    'Accetta e Continua' +
                '</button>' +
            '</div>';
    },
    
    controllaNDA() {
        if (!document.getElementById('nda-check').checked) {
            alert('Devi accettare i termini per continuare');
            return;
        }
        this.mostraDettagliServizio();
    },
    
    // STEP 3: DETTAGLI SERVIZIO
    mostraDettagliServizio() {
        const s = BREVETTIAMO.servizi[this.servizioCorrente];
        const modal = document.getElementById('modal-occhio');
        
        const prezzoText = s.prezzo ? s.prezzo + '€' + (s.periodo === 'mese' ? '/mese' : '') : 'Gratuito';
        const tipoText = s.tipo === 'abbonamento' ? 'Abbonamento mensile' : 
                         s.tipo === 'una_tantum' ? 'Pagamento unico' : 
                         s.tipo === 'combo' ? 'Pacchetto combo' : 
                         s.tipo === 'premium' ? 'Servizio premium' : 'Servizio';
        
        const flussoText = s.flusso ? s.flusso.join(' → ') : 'Carica brevetto → Analisi IA → Report';
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">' + s.nome + '</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="close-btn">X</button>' +
                '</div>' +
                
                '<div class="step-indicator mb-6">' +
                    '<div class="step completed"><span class="step-dot"></span>Benvenuto</div>' +
                    '<div class="step completed"><span class="step-dot"></span>NDA</div>' +
                    '<div class="step active"><span class="step-dot"></span>Dettagli</div>' +
                    '<div class="step"><span class="step-dot"></span>Form</div>' +
                '</div>' +
                
                '<div class="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-4">' +
                    '<div class="flex items-center justify-between mb-2">' +
                        '<span class="text-blue-300 font-bold">' + tipoText + '</span>' +
                        '<span class="text-green-400 font-bold text-xl">' + prezzoText + '</span>' +
                    '</div>' +
                    '<p class="text-blue-400 text-sm">' + s.descrizione + '</p>' +
                '</div>' +
                
                '<div class="bg-gray-700 rounded-lg p-4 mb-4">' +
                    '<p class="text-gray-300 text-sm mb-2"><i class="fas fa-route mr-2"></i><strong>Flusso:</strong></p>' +
                    '<p class="text-green-400 text-sm">' + flussoText + '</p>' +
                '</div>' +
                
                '<div class="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 mb-6">' +
                    '<p class="text-yellow-400 text-sm"><i class="fas fa-info-circle mr-2"></i>Durante la beta (60 giorni), questo servizio e completamente gratuito. Al termine, potrai scegliere se attivare l\'abbonamento.</p>' +
                '</div>' +
                
                '<button onclick="OCCHIO.apriForm()" class="btn w-full py-3 text-lg font-bold">' +
                    'Procedi con il caricamento <i class="fas fa-arrow-right ml-2"></i>' +
                '</button>' +
            '</div>';
    },
    
    // STEP 4: FORM CARICA BREVETTO (con upload disegni)
    apriForm() {
        const s = BREVETTIAMO.servizi[this.servizioCorrente];
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">' + s.nome + '</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="close-btn">X</button>' +
                '</div>' +
                
                '<div class="step-indicator mb-6">' +
                    '<div class="step completed"><span class="step-dot"></span>Benvenuto</div>' +
                    '<div class="step completed"><span class="step-dot"></span>NDA</div>' +
                    '<div class="step completed"><span class="step-dot"></span>Dettagli</div>' +
                    '<div class="step active"><span class="step-dot"></span>Form</div>' +
                '</div>' +
                
                '<p class="text-gray-300 mb-4">' + s.descrizione + '</p>' +
                
                '<form onsubmit="return false;">' +
                    '<label class="block text-gray-400 mb-2">Descrizione Tecnica *</label>' +
                    '<textarea id="desc-tecnica" rows="4" class="input" placeholder="Inserisci la descrizione tecnica del tuo brevetto..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Rivendicazioni (una per riga) *</label>' +
                    '<textarea id="rivendicazioni" rows="4" class="input" placeholder="1. Rivendicazione principale&#10;2. Rivendicazione secondaria..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Abstract (max 150 parole) *</label>' +
                    '<textarea id="abstract" rows="3" class="input" placeholder="Riassunto breve dell\'invenzione..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Disegni / Tavole Tecniche</label>' +
                    '<div class="upload-area" onclick="document.getElementById(\'file-upload\').click()">' +
                        '<i class="fas fa-cloud-upload-alt text-3xl text-gray-500 mb-2"></i>' +
                        '<p class="text-gray-400">Clicca per caricare o trascina i file</p>' +
                        '<p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, SVG (max 10MB)</p>' +
                        '<input type="file" id="file-upload" multiple accept=".pdf,.jpg,.jpeg,.png,.svg" style="display:none" onchange="OCCHIO.handleFileUpload(this)">' +
                    '</div>' +
                    '<div id="file-list" class="file-list"></div>' +
                    
                    '<label class="block text-gray-400 mb-2">Keywords tecniche</label>' +
                    '<input type="text" id="keywords" class="input" placeholder="meccanica, elettronica, software...">' +
                    
                    '<button onclick="OCCHIO.attiva()" class="btn w-full py-3 text-lg font-bold">' +
                        '<i class="fas fa-eye mr-2"></i>Attiva L\'OCCHIO' +
                    '</button>' +
                '</form>' +
            '</div>';
    },
    
    handleFileUpload(input) {
        const files = Array.from(input.files);
        this.filesCaricati = files;
        const list = document.getElementById('file-list');
        list.innerHTML = '';
        
        if (files.length > 0) {
            list.innerHTML = '<p class="text-green-400 text-sm mb-2"><i class="fas fa-check mr-1"></i>File caricati:</p>';
            files.forEach(file => {
                const size = (file.size / 1024).toFixed(1);
                list.innerHTML += 
                    '<div class="file-item">' +
                        '<i class="fas fa-file"></i>' +
                        '<span>' + file.name + ' (' + size + ' KB)</span>' +
                    '</div>';
            });
        }
    },
    
    // STEP 5: ATTIVA
    attiva() {
        const desc = document.getElementById('desc-tecnica').value;
        const riv = document.getElementById('rivendicazioni').value;
        const abs = document.getElementById('abstract').value;
        
        if (!desc || !riv || !abs) {
            alert('Compila tutti i campi obbligatori (*)');
            return;
        }
        
        const dati = {
            descrizione: desc,
            rivendicazioni: riv,
            abstract: abs,
            keywords: document.getElementById('keywords').value,
            files: this.filesCaricati.map(f => f.name),
            servizio: this.servizioCorrente,
            data: new Date().toISOString()
        };
        
        localStorage.setItem('occhio_brevetto', JSON.stringify(dati));
        
        this.chiudiModal();
        alert('L\'OCCHIO e ATTIVO! Sorveglianza 24/7 avviata.');
        location.href = 'dashboard-occhio.html?pacchetto=' + this.pacchetto + '&occhio=attivo';
    },
    
    apriModal() {
        document.getElementById('modal-occhio').style.display = 'flex';
        document.body.classList.add('modal-open');
    },
    
    chiudiModal() {
        document.getElementById('modal-occhio').style.display = 'none';
        document.body.classList.remove('modal-open');
    },
    
    caricaAllert() {
        const list = document.getElementById('allert-list');
        const noAllert = document.getElementById('no-allert');
        const count = document.getElementById('allert-count');
        
        const occhioAttivo = new URLSearchParams(location.search).get('occhio') === 'attivo';
        
        if (!occhioAttivo) {
            list.innerHTML = '';
            noAllert.style.display = 'block';
            count.textContent = '0';
            return;
        }
        
        noAllert.style.display = 'none';
        count.textContent = '1';
        
        list.innerHTML = 
            '<div class="allert-item">' +
                '<div class="flex items-center justify-between">' +
                    '<div class="flex items-center space-x-3">' +
                        '<i class="fas fa-info-circle text-blue-400"></i>' +
                        '<div>' +
                            '<p class="font-bold text-white">OCCHIO di Falco - Primo controllo</p>' +
                            '<p class="text-sm text-gray-400">Nessuna infrazione rilevata nel primo scan. Tutto pulito!</p>' +
                            '<p class="text-xs text-gray-500 mt-1">' + new Date().toLocaleString('it-IT') + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },
    
    caricaStatistiche() {
        const occhioAttivo = new URLSearchParams(location.search).get('occhio') === 'attivo';
        
        document.getElementById('stat-infrazioni').textContent = occhioAttivo ? '0' : '0';
        document.getElementById('stat-azioni').textContent = occhioAttivo ? '1' : '0';
        document.getElementById('stat-risparmio').textContent = occhioAttivo ? '1500' : '0';
        document.getElementById('stat-canali').textContent = '3';
    },
    
    caricaScadenze() {
        const container = document.getElementById('calendario-scadenze');
        const scadenze = [
            { nome: 'Estensione EPO', data: '2027-05-22', tipo: 'critical', giorni: 340 },
            { nome: 'Estensione PCT', data: '2027-05-22', tipo: 'warning', giorni: 340 },
            { nome: 'Rinnovo Annuale', data: '2028-05-22', tipo: 'info', giorni: 705 }
        ];
        
        container.innerHTML = '';
        
        scadenze.forEach(s => {
            const div = document.createElement('div');
            div.className = 'bg-gray-700 rounded-lg p-4 border-l-4 ' + 
                (s.tipo === 'critical' ? 'border-red-500' : 
                 s.tipo === 'warning' ? 'border-yellow-500' : 'border-blue-500');
            
            div.innerHTML = 
                '<div class="flex items-center justify-between">' +
                    '<div>' +
                        '<p class="font-bold text-white">' + s.nome + '</p>' +
                        '<p class="text-sm text-gray-400">' + s.data + '</p>' +
                    '</div>' +
                    '<div class="text-right">' +
                        '<span class="' + (s.tipo === 'critical' ? 'text-red-400' : 'text-yellow-400') + ' font-bold">' + s.giorni + ' gg</span>' +
                        '<p class="text-xs text-gray-500">rimanenti</p>' +
                    '</div>' +
                '</div>';
            
            container.appendChild(div);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => OCCHIO.init());

function logout() {
    location.href = 'index.html';
}
