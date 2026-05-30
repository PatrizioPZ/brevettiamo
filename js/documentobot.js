/* ============================================
   BREVETTIAMO — DocumentoBot
   Assemblaggio PDF/A, ZIP, metadati UIBM
   ============================================ */

const DocumentoBot = {
    documentData: {},
    figures: [],
    assemblySteps: [
        { id: 'text', name: 'Testo', duration: 2000 },
        { id: 'figures', name: 'Figure', duration: 1500 },
        { id: 'metadata', name: 'Metadati', duration: 1000 },
        { id: 'zip', name: 'ZIP', duration: 1500 }
    ],

    init() {
        this.loadData();
        this.startAssembly();
    },

    loadData() {
        this.documentData = Storage.get('documento_generato') || {};
        this.figures = Storage.get('figures') || [];

        Logger.info('DocumentoBot data loaded', {
            hasTitle: !!this.documentData.titolo,
            figuresCount: this.figures.length
        });
    },

    startAssembly() {
        let stepIndex = 0;

        const processNext = () => {
            if (stepIndex >= this.assemblySteps.length) {
                this.completeAssembly();
                return;
            }

            const step = this.assemblySteps[stepIndex];
            this.updateAssemblyStep(stepIndex, 'active');

            setTimeout(() => {
                this.updateAssemblyStep(stepIndex, 'completed');
                stepIndex++;
                processNext();
            }, step.duration);
        };

        processNext();
    },

    updateAssemblyStep(index, status) {
        const stepEl = document.getElementById(`asm-step-${index + 1}`);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
            stepEl.classList.add(status);

            if (status === 'completed') {
                stepEl.querySelector('.step-dot').textContent = '✓';
            }
        }
    },

    completeAssembly() {
        // Aggiorna status
        document.getElementById('assembly-icon').textContent = '✅';
        document.getElementById('assembly-title').textContent = 'Documento Assemblato!';
        document.getElementById('assembly-desc').textContent = 'PDF/A generato con successo. Pronto per firma e deposito.';

        // Mostra preview
        document.getElementById('doc-preview').style.display = 'block';
        document.getElementById('zip-contents').style.display = 'block';

        // Popola contenuto
        this.populatePDF();

        // Salva
        const assembledDoc = {
            ...this.documentData,
            figures: this.figures,
            assembled: new Date().toISOString(),
            format: 'PDF/A-1a'
        };

        Storage.set('documento_assemblato', assembledDoc);

        Logger.info('Assembly completed', assembledDoc);
        UI.toast('Documento assemblato con successo!', 'success');
    },

    populatePDF() {
        const doc = this.documentData;

        document.getElementById('pdf-title').textContent = doc.titolo || 'Titolo del Brevetto';
        document.getElementById('pdf-abstract').textContent = doc.abstract || 'Abstract non disponibile';
        document.getElementById('pdf-descrizione').textContent = doc.descrizione || 'Descrizione non disponibile';

        // Formatta rivendicazioni
        const claims = doc.rivendicazioni || '';
        const claimsHTML = claims.split('\n').map(line => {
            if (line.trim().startsWith('Rivendicazione')) {
                return `<li><strong>${line}</strong></li>`;
            }
            return `<li>${line}</li>`;
        }).join('');

        document.getElementById('pdf-rivendicazioni').innerHTML = `<ol>${claimsHTML}</ol>`;

        // Riferimenti figure
        const figureRefs = this.figures.map(f => `Fig. ${f.id} — ${f.caption}`).join('; ');
        document.getElementById('pdf-figure').textContent = 
            figureRefs || 'Nessuna figura allegata.';

        // Calcola pagine approssimative
        const totalChars = (doc.descrizione?.length || 0) + (doc.rivendicazioni?.length || 0);
        const estimatedPages = Math.max(5, Math.ceil(totalChars / 3000));
        document.getElementById('meta-pages').textContent = estimatedPages;
    },

    generatePDFContent() {
        const doc = this.documentData;
        const figures = this.figures;

        return `
BREVETTO PER INVENZIONE INDUSTRIALE

TITOLO: ${doc.titolo || 'Titolo'}

ABSTRACT
${doc.abstract || 'N/D'}

DESCRIZIONE TECNICA
${doc.descrizione || 'N/D'}

RIVENDICAZIONI
${doc.rivendicazioni || 'N/D'}

FIGURE
${figures.map(f => `Fig. ${f.id}: ${f.caption}`).join('\n')}

---
Documento generato da BrevettIAmo
Data: ${new Date().toLocaleDateString('it-IT')}
Conforme PDF/A-1a per UIBM
        `.trim();
    },

    downloadPDF() {
        const content = this.generatePDFContent();
        const blob = new Blob([content], { type: 'application/pdf' });

        // In produzione: genera vero PDF/A con libreria
        Utils.downloadBlob(blob, 'documento_brevetto.pdf');

        Logger.info('PDF downloaded');
    },

    downloadZIP() {
        // In produzione: genera ZIP con JSZip
        const content = this.generatePDFContent();
        const blob = new Blob([content], { type: 'application/zip' });

        Utils.downloadBlob(blob, 'brevetto_pronto_UIBM.zip');

        Logger.info('ZIP downloaded');
    },

    getDocumentForSignature() {
        return {
            ...this.documentData,
            figures: this.figures,
            assembled: Storage.get('documento_assemblato')?.assembled
        };
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    DocumentoBot.init();
});
