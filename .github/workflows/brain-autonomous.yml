// =========================================================
// BREVETTIAMO BRAIN READER v2.0
// Legge brain-response.txt dal repo e lo mostra nell'interfaccia
// Da aggiungere in brevettiamo-brain.html
// =========================================================

class BrainReader {
    constructor() {
        this.repo = 'PatrizioPZ/brevettiamo';
        this.ghToken = null;
        this.pollingInterval = null;
        this.lastResponse = null;
    }

    async initialize() {
        // Carica GH_TOKEN da Supabase
        try {
            const { data, error } = await supabase
                .from('secrets')
                .select('value')
                .eq('key', 'GH_TOKEN')
                .single();
            
            if (!error && data) {
                this.ghToken = data.value;
            }
        } catch (e) {
            console.log('GH_TOKEN non in Supabase, uso fetch pubblico');
        }

        // Avvia polling per brain-response.txt
        this.startPolling();
        
        console.log('BrainReader: Inizializzato');
    }

    startPolling() {
        // Controlla ogni 10 secondi se c'e' una nuova risposta
        this.pollingInterval = setInterval(() => {
            this.checkForResponse();
        }, 10000);
        
        // Primo check immediato
        this.checkForResponse();
    }

    async checkForResponse() {
        try {
            const response = await this.fetchFile('brain-response.txt');
            if (!response) return;
            
            // Evita di mostrare la stessa risposta
            if (response === this.lastResponse) return;
            this.lastResponse = response;
            
            // Mostra nella textarea
            this.showResponse(response);
            
        } catch (e) {
            // File non esiste, normale
        }
    }

    async fetchFile(filename) {
        const headers = {};
        if (this.ghToken) {
            headers['Authorization'] = `token ${this.ghToken}`;
        }
        
        // Prova con raw.githubusercontent.com (pubblico)
        const url = `https://raw.githubusercontent.com/${this.repo}/main/${filename}`;
        
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        
        return await res.text();
    }

    showResponse(text) {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;
        
        // Aggiungi alla textarea invece di sovrascrivere
        const separator = '\n\n' + '='.repeat(50) + '\n\n';
        const current = textarea.value;
        
        if (current.includes('RISPOSTA BREVETTIAMO BRAIN')) {
            // Sostituisci risposta precedente
            textarea.value = text;
        } else {
            // Aggiungi dopo il comando
            textarea.value = current + separator + text;
        }
        
        // Scroll in fondo
        textarea.scrollTop = textarea.scrollHeight;
        
        // Notifica visiva
        this.flashNotification('Nuova risposta da Brain!');
    }

    flashNotification(message) {
        // Crea notifica temporanea
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff88;
            color: #000;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.5s ease;
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => notif.remove(), 500);
        }, 4000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    window.BrainReader = new BrainReader();
    window.BrainReader.initialize();
});
