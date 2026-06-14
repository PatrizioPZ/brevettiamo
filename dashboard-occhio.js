// ============================================================
// BREVETTIAMO - dashboard-occhio.js
// Flusso: Click Usa -> Benvenuto Beta -> NDA -> Form -> Attiva
// ============================================================

const OCCHIO = {
    pacchetto: '',
    servizioCorrente: null,
    
    init() {
        this.pacchetto = new URLSearchParams(location.search).get('pacchetto') || 'starter';
        const p = BREVETTIAMO.pacchetti[this.pacchetto] || BREVETTIAMO.pacchetti.starter;
        
        document.getElementById('pacchetto-nome').textContent = p.nome;
        document.getElementById('canali-monitorati').textContent = p.canali_allert === 'tutti' ? 'tutti' : p.canali_allert;
        
        this.caricaServizi(p);
    },
    
    caricaServizi(p) {
        const grid = document.getElementById('servizi-grid');
        grid.innerHTML = '';
        
        p.servizi_disponibili.forEach(id => {
            const s = BREVETTIAMO.servizi[id];
            if (!s) return;
            
            const div = document.createElement('div');
            div.className = 'card';
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
        const s = BREVETTIAMO.servizi[id];
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">Benvenuto in Beta!</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="text-gray-400 hover:text-white">X</button>' +
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
        
        modal.style.display = 'flex';
    },
    
    // STEP 2: NDA E PRIVACY
    apriNDA() {
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">NDA e Privacy</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="text-gray-400 hover:text-white">X</button>' +
                '</div>' +
                '<div class="bg-gray-700 rounded-lg p-4 mb-4 max-h-48 overflow-auto">' +
                    '<p class="text-gray-300 text-sm">I dati inseriti sono protetti e crittografati. Non condividiamo informazioni con terze parti. L\'OCCHIO opera in modalita sorveglianza automatizzata. I tuoi brevetti sono protetti da accordo di riservatezza.</p>' +
                '</div>' +
                '<div class="mb-6">' +
                    '<label class="flex items-center cursor-pointer">' +
                        '<input type="checkbox" id="nda-check" class="mr-2">' +
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
        this.apriForm();
    },
    
    // STEP 3: FORM CARICA BREVETTO
    apriForm() {
        const s = BREVETTIAMO.servizi[this.servizioCorrente];
        const modal = document.getElementById('modal-occhio');
        
        modal.innerHTML = 
            '<div class="modal-content">' +
                '<div class="flex items-center justify-between mb-6">' +
                    '<h2 class="text-2xl font-bold text-white">' + s.nome + '</h2>' +
                    '<button onclick="OCCHIO.chiudiModal()" class="text-gray-400 hover:text-white">X</button>' +
                '</div>' +
                '<p class="text-gray-300 mb-4">' + s.descrizione + '</p>' +
                '<form onsubmit="return false;">' +
                    '<label class="block text-gray-400 mb-2">Descrizione Tecnica *</label>' +
                    '<textarea id="desc-tecnica" rows="4" class="input" placeholder="Inserisci la descrizione tecnica..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Rivendicazioni (una per riga) *</label>' +
                    '<textarea id="rivendicazioni" rows="4" class="input" placeholder="1. Rivendicazione principale..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Abstract (max 150 parole) *</label>' +
                    '<textarea id="abstract" rows="3" class="input" placeholder="Riassunto breve..."></textarea>' +
                    
                    '<label class="block text-gray-400 mb-2">Keywords tecniche</label>' +
                    '<input type="text" id="keywords" class="input" placeholder="meccanica, elettronica, software...">' +
                    
                    '<button onclick="OCCHIO.attiva()" class="btn w-full py-3 text-lg font-bold">' +
                        '<i class="fas fa-eye mr-2"></i>Attiva L\'OCCHIO' +
                    '</button>' +
                '</form>' +
            '</div>';
    },
    
    // STEP 4: ATTIVA
    attiva() {
        const desc = document.getElementById('desc-tecnica').value;
        const riv = document.getElementById('rivendicazioni').value;
        const abs = document.getElementById('abstract').value;
        
        if (!desc || !riv || !abs) {
            alert('Compila tutti i campi obbligatori (*)');
            return;
        }
        
        localStorage.setItem('occhio_brevetto', JSON.stringify({
            descrizione: desc,
            rivendicazioni: riv,
            abstract: abs,
            keywords: document.getElementById('keywords').value,
            servizio: this.servizioCorrente,
            data: new Date().toISOString()
        }));
        
        this.chiudiModal();
        alert('L\'OCCHIO e ATTIVO! Sorveglianza 24/7 avviata.');
        location.href = 'dashboard-occhio.html?pacchetto=' + this.pacchetto + '&occhio=attivo';
    },
    
    chiudiModal() {
        document.getElementById('modal-occhio').style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => OCCHIO.init());

function logout() {
    location.href = 'index.html';
}
