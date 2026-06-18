const PARTNERS_API_URL = 'https://sheetdb.io/api/v1/t8unus6h6n4cj';

async function caricaPartners() {
    const container = document.getElementById('partners-container');
    if (!container) {
        console.error('Container partners non trovato');
        return;
    }
    
    try {
        const response = await fetch(PARTNERS_API_URL);
        const data = await response.json();
        console.log('Partners ricevuti:', data);
        
        let html = '';
        
        data.forEach(item => {
            if (item['Attivo'] !== 'SI' || item['Stato'] !== 'Approvato') return;
            if (item['Nome Cliente'] === 'BrevettIAmo') return;
            
            const nome = item['Nome Cliente'] || 'Partner';
            const link = item['URL Sito'] || '#';
            const img = item['URL Logo'] || '';
            
            html += `
                <a href="${link}" target="_blank" rel="noopener" style="display: block; background: rgba(255,255,255,0.05); border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 30px 20px; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(197,160,89,0.6)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(197,160,89,0.3)'">
                    <img src="${img}" alt="${nome}" style="max-width: 160px; max-height: 70px; object-fit: contain; margin-bottom: 15px; filter: brightness(0) invert(1);" onerror="this.onerror=null; this.src='https://via.placeholder.com/150x60?text=Partner'">
                    <div style="color: #c5a059; font-weight: bold; font-size: 1rem;">${nome}</div>
                </a>
            `;
        });
        
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(197,160,89,0.3); border-radius: 12px; padding: 30px 20px; min-height: 120px;">
                <div style="color: #c5a059; font-size: 1.1rem; font-weight: bold; margin-bottom: 8px; text-align: center;">Aggiungi la tua pubblicita</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; text-align: center;">Gratis in versione BETA</div>
                <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-top: 10px; text-align: center; font-style: italic;">Clicca su "Diventa Partner" per iniziare</div>
            </div>
        `;
        
        html += `
            <a href="pubblicita.html" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: transparent; border: 2px dashed #c5a059; border-radius: 12px; padding: 30px 20px; text-decoration: none; transition: all 0.3s; min-height: 150px;">
                <div style="width: 50px; height: 50px; border: 2px solid #c5a059; color: #c5a059; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin-bottom: 15px;">+</div>
                <div style="color: #c5a059; font-size: 1rem; font-weight: bold;">Diventa Partner</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 5px;">Pubblicizza la tua azienda</div>
            </a>
        `;
        
        container.innerHTML = html || '';
        
    } catch (error) {
        console.error('Errore caricamento partners:', error);
        container.innerHTML = '<div style="color: rgba(255,255,255,0.5); padding: 40px;">Nessun partner al momento</div>';
    }
}

document.addEventListener('DOMContentLoaded', caricaPartners);
