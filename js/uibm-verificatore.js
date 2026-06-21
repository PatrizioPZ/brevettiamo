// js/uibm-verificatore.js — Verificatore conformità UIBM

class UIBMVerificatore {
    constructor() {
        this.direttive = UIBM_DIRETTIVE;
        this.errori = [];
        this.warning = [];
        this.info = [];
    }
    
    verifica(testoIA, tipoServizio) {
        this.errori = [];
        this.warning = [];
        this.info = [];
        
        const testo = testoIA.toLowerCase();
        
        this.verificaCoerenzaNumerazione(testo);
        this.verificaLinguaggio(testo);
        
        if (tipoServizio === 'servizio-tavole' || tipoServizio === 'servizio-cad') {
            this.verificaDisegni(testo);
        }
        
        if (tipoServizio === 'servizio-deposito') {
            this.verificaRivendicazioni(testo);
            this.verificaDescrizione(testo);
            this.verificaRiassunto(testo);
        }
        
        if (tipoServizio === 'servizio-rivendicazioni') {
            this.verificaRivendicazioni(testo);
        }
        
        this.verificaFormattazione(testo);
        
        return {
            passato: this.errori.length === 0,
            errori: this.errori,
            warning: this.warning,
            info: this.info,
            riepilogo: this.generaRiepilogo()
        };
    }
    
    verificaCoerenzaNumerazione(testo) {
        const numeri = testo.match(/\b\d{3}\b/g);
        if (numeri) {
            const unici = [...new Set(numeri)];
            this.info.push('Numeri trovati: ' + unici.join(', ') + ' — verificare coerenza tra documenti');
        }
    }
    
    verificaLinguaggio(testo) {
        const vietato = ['inoltre', 'anche', 'in più', 'più oltre'];
        vietato.forEach(parola => {
            if (testo.includes(parola.toLowerCase())) {
                this.warning.push('Linguaggio rivendicazioni: evitare "' + parola + '"');
            }
        });
    }
    
    verificaDisegni(testo) {
        const coloriVietati = ['colore', 'colori', 'rosso', 'blu', 'verde', 'giallo', 'rgb', 'hex'];
        coloriVietati.forEach(c => {
            if (testo.includes(c)) {
                this.errori.push('DISEGNO: Riferimento a colore ("' + c + '") — UIBM richiede bianco e nero');
            }
        });
        
        if (testo.includes('ombreggiatura') || testo.includes('sfumatura') || testo.includes('gradiente')) {
            this.errori.push('DISEGNO: Ombreggiature/sfumature vietate');
        }
        
        if (testo.includes('descrizione sul disegno') || testo.includes('testo nel disegno')) {
            this.errori.push('DISEGNO: Solo numeri, niente descrizioni scritte');
        }
        
        if (!testo.includes('mm') && !testo.includes('millimetri')) {
            this.warning.push('DISEGNO: Misure in mm non trovate');
        }
        
        const figMatches = testo.match(/FIG\.\s*\d+/g);
        if (figMatches) {
            this.info.push('DISEGNI: Trovate ' + figMatches.length + ' figure numerate');
        } else {
            this.warning.push('DISEGNI: Numerazione FIG. X non trovata');
        }
        
        if (testo.includes('fig.') && testo.match(/fig\.\s*\d+\s+[a-zA-Z]{10,}/)) {
            this.errori.push('DISEGNI: Descrizione dopo FIG. X — SOLO numero');
        }
    }
    
    verificaRivendicazioni(testo) {
        const matches = testo.match(/rivendicazione/g);
        const numero = matches ? matches.length : 0;
        
        if (numero > 10) {
            this.warning.push('RIVENDICAZIONI: ' + numero + ' trovate — oltre 10 potrebbe richiedere supplemento');
        } else if (numero === 0) {
            this.errori.push('RIVENDICAZIONI: Nessuna trovata');
        } else {
            this.info.push('RIVENDICAZIONI: ' + numero + ' trovate — prime 10 incluse in 50€');
        }
        
        if (!testo.includes('caratterizzato dal fatto di')) {
            this.warning.push('RIVENDICAZIONI: Usare "caratterizzato dal fatto di"');
        }
    }
    
    verificaDescrizione(testo) {
        const sezioni = ['campo tecnico', 'stato dell\'arte', 'riassunto', 'descrizione dettagliata'];
        const mancanti = sezioni.filter(s => !testo.includes(s.toLowerCase()));
        
        if (mancanti.length > 0) {
            this.warning.push('DESCRIZIONE: Sezioni mancanti — ' + mancanti.join(', '));
        }
        
        if (!testo.includes('l\'invenzione è applicabile') && !testo.includes('l\'invenzione e applicabile')) {
            this.warning.push('DESCRIZIONE: Iniziare con "L\'invenzione è applicabile..."');
        }
    }
    
    verificaRiassunto(testo) {
        const matchIT = testo.match(/riassunto[\s\S]{0,500}italiano/i);
        const matchEN = testo.match(/riassunto[\s\S]{0,500}inglese/i);
        
        if (!matchIT) this.warning.push('RIASSUNTO: Verificare versione italiana');
        if (!matchEN) this.warning.push('RIASSUNTO: Verificare versione inglese');
        
        const parole = testo.split(/\s+/).length;
        if (parole > 300) {
            this.warning.push('RIASSUNTO: Testo lungo (' + parole + ' parole) — verificare max 150');
        }
    }
    
    verificaFormattazione(testo) {
        if (!testo.includes('arial') && !testo.includes('helvetica')) {
            this.warning.push('FORMATTAZIONE: Verificare font Arial/Helvetica');
        }
        
        if (!testo.includes('a4') && !testo.includes('210 x 297')) {
            this.warning.push('FORMATTAZIONE: Verificare formato A4');
        }
        
        if (!testo.includes('25mm') && !testo.includes('margin')) {
            this.warning.push('FORMATTAZIONE: Verificare margini 25mm');
        }
    }
    
    generaRiepilogo() {
        if (this.errori.length === 0 && this.warning.length === 0) {
            return { classe: 'success', messaggio: 'Tutti i controlli UIBM superati', colore: '#10b981' };
        } else if (this.errori.length === 0) {
            return { classe: 'warning', messaggio: this.warning.length + ' warning — verificare prima del deposito', colore: '#f59e0b' };
        } else {
            return { classe: 'error', messaggio: this.errori.length + ' errori — CORREGGERE prima del deposito', colore: '#dc2626' };
        }
    }
    
    generaHTML() {
        let html = '<div style="margin-top: 20px; padding: 15px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb;">';
        
        const riepilogo = this.generaRiepilogo();
        html += '<div style="padding: 12px; border-radius: 6px; background: ' + riepilogo.colore + '20; border-left: 4px solid ' + riepilogo.colore + '; margin-bottom: 15px;">';
        html += '<strong style="color: ' + riepilogo.colore + ';">' + riepilogo.messaggio + '</strong>';
        html += '</div>';
        
        if (this.errori.length > 0) {
            html += '<h4 style="color: #dc2626; margin-bottom: 8px;">Errori (' + this.errori.length + ')</h4><ul style="color: #dc2626; margin-bottom: 15px;">';
            this.errori.forEach(e => html += '<li>' + e + '</li>');
            html += '</ul>';
        }
        
        if (this.warning.length > 0) {
            html += '<h4 style="color: #f59e0b; margin-bottom: 8px;">Warning (' + this.warning.length + ')</h4><ul style="color: #92400e; margin-bottom: 15px;">';
            this.warning.forEach(w => html += '<li>' + w + '</li>');
            html += '</ul>';
        }
        
        if (this.info.length > 0) {
            html += '<h4 style="color: #2563eb; margin-bottom: 8px;">Note (' + this.info.length + ')</h4><ul style="color: #1e40af;">';
            this.info.forEach(i => html += '<li>' + i + '</li>');
            html += '</ul>';
        }
        
        html += '</div>';
        return html;
    }
}

if (typeof window !== 'undefined') {
    window.UIBMVerificatore = UIBMVerificatore;
}
