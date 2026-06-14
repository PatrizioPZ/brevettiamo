const dashboard = {
  init() {
    this.pacchetto = new URLSearchParams(location.search).get('pacchetto') || 'starter';
    const p = BREVETTIAMO.pacchetti[this.pacchetto] || BREVETTIAMO.pacchetti.starter;
    document.getElementById('pacchetto-nome').textContent = p.nome;
    document.getElementById('canali-monitorati').textContent = p.canali_allert === 'tutti' ? 'tutti' : p.canali_allert;
    
    const grid = document.getElementById('servizi-grid');
    grid.innerHTML = '';
    p.servizi_disponibili.forEach(id => {
      const s = BREVETTIAMO.servizi[id];
      if (!s) return;
      const div = document.createElement('div');
      div.className = 'bg-gray-800 rounded-xl p-6 border border-gray-700';
      div.innerHTML = '<h4 class="font-bold text-white mb-2">' + s.nome + '</h4><p class="text-sm text-gray-400 mb-4">' + s.descrizione + '</p><button onclick="dashboard.apriForm(\'' + id + '\')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm text-white">Usa</button>';
      grid.appendChild(div);
    });
  },
  
  apriForm(id) {
    const s = BREVETTIAMO.servizi[id];
    if (!s) return;
    let m = document.getElementById('modal-occhio');
    if (m) m.remove();
    m = document.createElement('div');
    m.id = 'modal-occhio';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:50;display:flex;align-items:center;justify-content:center;';
    m.innerHTML = '<div style="background:#1e293b;border:1px solid #3b82f6;border-radius:12px;padding:2rem;max-width:600px;width:90%;max-height:90vh;overflow:auto;color:white;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;"><h2 style="font-size:1.5rem;font-weight:bold;">' + s.nome + '</h2><button onclick="document.getElementById(\'modal-occhio\').remove()" style="color:#9ca3af;">X</button></div><p style="color:#d1d5db;margin-bottom:1rem;">' + s.descrizione + '</p><form onsubmit="return false;"><div style="margin-bottom:1rem;"><label style="display:block;color:#9ca3af;margin-bottom:0.5rem;">Descrizione Tecnica</label><textarea id="desc-tecnica" rows="4" style="width:100%;background:#374151;border:1px solid #4b5563;border-radius:8px;padding:0.5rem;color:white;"></textarea></div><div style="margin-bottom:1rem;"><label style="display:block;color:#9ca3af;margin-bottom:0.5rem;">Rivendicazioni</label><textarea id="rivendicazioni" rows="4" style="width:100%;background:#374151;border:1px solid #4b5563;border-radius:8px;padding:0.5rem;color:white;"></textarea></div><div style="margin-bottom:1rem;"><label style="display:block;color:#9ca3af;margin-bottom:0.5rem;">Abstract</label><textarea id="abstract" rows="3" style="width:100%;background:#374151;border:1px solid #4b5563;border-radius:8px;padding:0.5rem;color:white;"></textarea></div><button onclick="dashboard.attiva()" style="background:#2563eb;color:white;padding:0.75rem 1.5rem;border-radius:8px;border:none;cursor:pointer;">Attiva ' + s.nome + '</button></form></div>';
    document.body.appendChild(m);
  },
  
  attiva() {
    alert('L\'OCCHIO e ATTIVO!');
    document.getElementById('modal-occhio').remove();
    location.href = 'dashboard-occhio.html?pacchetto=' + this.pacchetto + '&occhio=attivo';
  }
};

document.addEventListener('DOMContentLoaded', () => dashboard.init());
function logout() { location.href = 'index.html'; }
