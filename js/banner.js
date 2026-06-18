const API_URL = 'https://sheetdb.io/api/v1/t8unus6h6n4cj';

async function caricaBanner() {
    const grid = document.getElementById('banner-container');
    if (!grid) {
        console.error('ERRORE: Grid banner non trovata nel DOM!');
        return;
    }
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            grid.innerHTML = '<div style="text-align:center;color:#888;padding:30px;">Spazio pubblicitario disponibile</div>';
            return;
        }

        let html = '';

        data.forEach(item => {
            if (item['Attivo'] !== 'SI' || item['Stato'] !== 'Approvato') return;
            
            const nome = item['Nome Cliente'] || 'Cliente';
            const link = item['URL Sito'] || '#';
            const img = item['URL Logo'] || '';
            const titolo = item['Nome Cliente'] || nome;
            
            html += `
                <div style="background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <a href="${link}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">
                        <img src="${img}" alt="${nome}" style="max-width:160px;max-height:70px;object-fit:contain;margin-bottom:10px;" onerror="this.onerror=null; this.src='https://via.placeholder.com/150x60?text=Partner'">
                        <div style="font-weight:bold;color:#333;">${titolo}</div>
                    </a>
                </div>
            `;
        });

        html += `
            <a href="pubblicita.html" target="_blank" rel="noopener noreferrer" style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;border:2px dashed var(--oro);border-radius:12px;padding:20px;text-decoration:none;transition:all 0.3s;min-height:120px;">
                <div style="width:40px;height:40px;background:var(--oro);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;margin-bottom:8px;">+</div>
                <div style="color:var(--ferro);font-size:0.85rem;text-align:center;">Richiedi<br>pubblicita</div>
            </a>
        `;

        grid.innerHTML = html || '<div style="text-align:center;color:#888;padding:30px;">Spazio pubblicitario disponibile</div>';
        
    } catch (error) {
        console.error('Errore caricamento banner:', error);
        if (grid) grid.innerHTML = '<div style="text-align:center;color:#888;padding:30px;">Spazio pubblicitario disponibile</div>';
    }
}

document.addEventListener('DOMContentLoaded', caricaBanner);
