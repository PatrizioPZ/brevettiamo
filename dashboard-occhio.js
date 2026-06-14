// L'OCCHIO - Dashboard JavaScript
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
                    '<button onclick="OCCHIO.apriModal(\'' + id + '\')" class="btn">' +
                        '<i class="fas fa-play mr-1"></i> Usa' +
                    '</button>' +
                '</div>';
            
            grid.appendChild(div);
        });
    },
    
    apriModal(id) {
        const s = BREVETTIAMO.servizi[id];
        if (!s) return;
        this.servizioCorrente = id;
        
        document.getElementById('modal-title').textContent = s.nome;
        document.getElementById('modal-desc').textContent = s.descrizione;
        document.getElementById('modal-occhio').style.display = 'flex';
    }
};

function chiudiModal() {
    document.getElementById('modal-occhio').style.display = 'none';
}

function attivaOcchio() {
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
        servizio: OCCHIO.servizioCorrente,
        data: new Date().toISOString()
    }));
    
    chiudiModal();
    alert('L\'OCCHIO e ATTIVO! Sorveglianza 24/7 avviata.');
    location.href = 'occhio-dashboard.html?pacchetto=' + OCCHIO.pacchetto + '&occhio=attivo';
}

function logout() {
    location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => OCCHIO.init());
