// ============================================================
// BREVETTIAMO - dashboard-occhio.js
// Logica dinamica: carica servizi per pacchetto, fair share IA, allert
// ============================================================

class BrevettIAmoDashboard {
  constructor() {
    this.config = BREVETTIAMO;
    this.pacchetto = this.getPacchettoFromURL();
    this.servizi = [];
    this.analisiOggi = 0;
    this.analisiLimite = this.calcolaFairShare();
    this.allert = [];
    
    this.init();
  }
  
  // --- INIZIALIZZAZIONE ---
  init() {
    this.caricaPacchetto();
    this.caricaServizi();
    this.caricaAllert();
    this.caricaStatistiche();
    this.caricaScadenze();
    this.aggiornaUI();
    this.startAutoRefresh();
  }
  
  // --- PACCHETTO ---
  getPacchettoFromURL() {
    const params = new URLSearchParams(window.location.search);
    const pacchetto = params.get('pacchetto') || 'starter';
    
    if (!this.config.pacchetti[pacchetto]) {
      console.warn('Pacchetto non valido, uso starter');
      return 'starter';
    }
    return pacchetto;
  }
  
  caricaPacchetto() {
    const p = this.config.pacchetti[this.pacchetto];
    document.getElementById('pacchetto-nome').textContent = p.nome;
    document.getElementById('canali-monitorati').textContent = 
      p.canali_allert === 'tutti' ? 'tutti' : p.canali_allert;
  }
  
  // --- FAIR SHARE IA ---
  calcolaFairShare() {
    // Simulazione: in produzione, questo viene dal server
    const utentiAttiviOggi = this.simulaUtentiAttivi();
    const limiteTotale = this.config.beta.fair_share.limite_giornaliero_totale;
    
    let fairShare = Math.floor(limiteTotale / utentiAttiviOggi);
    fairShare = Math.min(fairShare, this.config.beta.fair_share.max_per_utente);
    fairShare = Math.max(fairShare, this.config.beta.fair_share.min_per_utente);
    
    return fairShare;
  }
  
  simulaUtentiAttivi() {
    // In produzione: fetch dal server
    // Per demo: numero casuale tra 10 e 50
    return Math.floor(Math.random() * 40) + 10;
  }
  
  // --- SERVIZI ---
  caricaServizi() {
    const p = this.config.pacchetti[this.pacchetto];
    const serviziDisponibili = p.servizi_disponibili;
    
    this.servizi = serviziDisponibili.map(id => {
      const servizio = this.config.servizi[id];
      return {
        ...servizio,
        limite: servizio.limiti[this.pacchetto],
        usato: 0
      };
    });
    
    this.renderServizi();
  }
  
  renderServizi() {
    const grid = document.getElementById('servizi-grid');
    grid.innerHTML = '';
    
    this.servizi.forEach(servizio => {
      const card = this.creaCardServizio(servizio);
      grid.appendChild(card);
    });
  }
  
  creaCardServizio(servizio) {
    const div = document.createElement('div');
    div.className = 'service-card card-hover';
    
    const limiteText = servizio.limite === 'illimitati' ? 'Illimitati' : 
                       servizio.limite === 0 ? 'Non disponibile' : 
                       `${servizio.usato}/${servizio.limite}`;
    
    const statusClass = servizio.limite === 0 ? 'text-gray-500' : 'text-green-400';
    const icona = this.getIconaServizio(servizio.icona);
    
    div.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-xl bg-blue-900 bg-opacity-50 flex items-center justify-center">
            <i class="${icona} text-xl text-blue-400"></i>
          </div>
          <div>
            <h4 class="font-bold text-white">${servizio.nome}</h4>
            <p class="text-sm text-gray-400">${servizio.descrizione}</p>
          </div>
        </div>
        <span class="${statusClass} text-sm font-bold">${limiteText}</span>
      </div>
      
      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center space-x-2">
          <span class="status-dot ${servizio.limite === 0 ? 'bg-gray-600' : 'status-active'}"></span>
          <span class="text-xs text-gray-400">
            ${servizio.limite === 0 ? 'Non attivo' : 'L\'OCCHIO pronto'}
          </span>
        </div>
        
        ${servizio.limite !== 0 ? `
          <button onclick="dashboard.usoServizio('${servizio.id}')" 
                  class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">
            <i class="fas fa-play mr-1"></i> Usa
          </button>
        ` : ''}
      </div>
      
      ${servizio.id === 'allert_ia' ? `
        <div class="mt-3 p-2 bg-green-900 bg-opacity-30 rounded-lg border border-green-800">
          <p class="text-xs text-green-400">
            <i class="fas fa-eye mr-1"></i>
            Sorveglianza attiva su ${this.config.pacchetti[this.pacchetto].canali_allert} canali
          </p>
        </div>
      ` : ''}
    `;
    
    return div;
  }
  
  getIconaServizio(icona) {
    const map = {
      'search': 'fas fa-search',
      'edit': 'fas fa-edit',
      'check': 'fas fa-check-circle',
      'ruler': 'fas fa-ruler-combined',
      'language': 'fas fa-language',
      'europe': 'fas fa-globe-europe',
      'world': 'fas fa-globe',
      'eye': 'fas fa-eye',
      'shield': 'fas fa-shield-alt',
      'gavel': 'fas fa-gavel',
      'network': 'fas fa-network-wired',
      'calendar': 'fas fa-calendar-alt',
      'file-pdf': 'fas fa-file-pdf'
    };
    return map[icona] || 'fas fa-cube';
  }
  
  // --- USO SERVIZIO (Fair Share) ---
  async usoServizio(servizioId) {
    if (this.analisiOggi >= this.analisiLimite) {
      this.mostraMessaggio(
        'Limite giornaliero raggiunto',
        this.config.beta.messaggi.limite_raggiunto.replace('{n}', this.analisiLimite),
        'warning'
      );
      return;
    }
    
    const servizio = this.servizi.find(s => s.id === servizioId);
    if (!servizio || servizio.limite === 0) return;
    
    // Simula chiamata IA
    this.analisiOggi++;
    servizio.usato++;
    
    // Aggiorna UI
    this.aggiornaAnalisiUI();
    this.renderServizi();
    
    // Mostra loading
    this.mostraMessaggio(
      'Analisi in corso',
      'L\'OCCHIO sta analizzando...',
      'info'
    );
    
    // Simula risposta IA (2-3 secondi)
    setTimeout(() => {
      this.mostraMessaggio(
        'Analisi completata',
        `Risultato pronto per ${servizio.nome}`,
        'success'
      );
    }, 2000);
  }
  
  // --- ALLERT ---
  caricaAllert() {
    // Simula allert (in produzione: fetch dal server)
    this.allert = this.simulaAllert();
    this.renderAllert();
  }
  
  simulaAllert() {
    // Demo: 0 allert per mostrare "tutto ok"
    // In produzione: allert reali dal backend
    return [];
  }
  
  renderAllert() {
    const list = document.getElementById('allert-list');
    const noAllert = document.getElementById('no-allert');
    const count = document.getElementById('allert-count');
    
    count.textContent = this.allert.length;
    
    if (this.allert.length === 0) {
      list.innerHTML = '';
      noAllert.style.display = 'block';
      return;
    }
    
    noAllert.style.display = 'none';
    list.innerHTML = '';
    
    this.allert.forEach(allert => {
      const div = document.createElement('div');
      div.className = `allert-item ${allert.livello === 'critical' ? 'allert-critical' : ''}`;
      
      const colori = {
        warning: 'text-yellow-400',
        critical: 'text-red-400'
      };
      
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <i class="fas fa-exclamation-triangle ${colori[allert.livello]}"></i>
            <div>
              <p class="font-bold text-white">${allert.titolo}</p>
              <p class="text-sm text-gray-400">${allert.messaggio}</p>
              <p class="text-xs text-gray-500 mt-1">${allert.data}</p>
            </div>
          </div>
          <button class="text-blue-400 hover:text-blue-300">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      `;
      
      list.appendChild(div);
    });
  }
  
  // --- STATISTICHE ---
  caricaStatistiche() {
    // In produzione: fetch dal server
    document.getElementById('stat-infrazioni').textContent = '0';
    document.getElementById('stat-azioni').textContent = '0';
    document.getElementById('stat-risparmio').textContent = '0';
    document.getElementById('stat-canali').textContent = 
      this.config.pacchetti[this.pacchetto].canali_allert;
  }
  
  // --- SCADENZE ---
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
      
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-white">${s.nome}</p>
            <p class="text-sm text-gray-400">${s.data}</p>
          </div>
          <div class="text-right">
            <span class="${s.tipo === 'critical' ? 'text-red-400' : 'text-yellow-400'} font-bold">
              ${s.giorni} gg
            </span>
            <p class="text-xs text-gray-500">rimanenti</p>
          </div>
        </div>
      `;
      
      container.appendChild(div);
    });
  }
  
  // --- UI ---
  aggiornaUI() {
    this.aggiornaAnalisiUI();
    document.getElementById('beta-limite').textContent = this.analisiLimite;
    document.getElementById('beta-giorni').textContent = '60';
  }
  
  aggiornaAnalisiUI() {
    document.getElementById('analisi-usate').textContent = this.analisiOggi;
    document.getElementById('analisi-totali').textContent = this.analisiLimite;
  }
  
  mostraMessaggio(titolo, messaggio, tipo) {
    // Rimuovi toast precedenti
    const esistenti = document.querySelectorAll('.toast');
    esistenti.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ` +
      (tipo === 'success' ? 'bg-green-800 border border-green-600' :
       tipo === 'warning' ? 'bg-yellow-800 border border-yellow-600' :
       tipo === 'error' ? 'bg-red-800 border border-red-600' :
       'bg-blue-800 border border-blue-600');
    
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas ${tipo === 'success' ? 'fa-check' : tipo === 'warning' ? 'fa-exclamation' : 'fa-info-circle'} text-white"></i>
        <div>
          <p class="font-bold text-white">${titolo}</p>
          <p class="text-sm text-gray-200">${messaggio}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // --- AUTO REFRESH ---
  startAutoRefresh() {
    // Aggiorna ogni 5 minuti
    setInterval(() => {
      this.caricaAllert();
      this.caricaStatistiche();
    }, 300000);
  }
}

// --- INIZIALIZZAZIONE ---
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
  dashboard = new BrevettIAmoDashboard();
});

function logout() {
  window.location.href = 'index.html';
}
