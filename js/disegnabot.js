/* ============================================
   BREVETTIAMO — DisegnaBot
   Generazione SVG figure + didascalie + gestione upload
   ============================================ */

const DisegnaBot = {
    figures: [],
    figureCount: 2,

    init() {
        this.setupUpload();
        this.loadFigures();
    },

    setupUpload() {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');

        if (!dropArea || !fileInput) return;

        // Drag & drop
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'var(--primary)';
            dropArea.style.background = 'var(--bg-secondary)';
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.style.borderColor = 'var(--border)';
            dropArea.style.background = 'transparent';
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'var(--border)';
            dropArea.style.background = 'transparent';
            this.handleFiles(e.dataTransfer.files);
        });

        // File input
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    },

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                UI.toast(`File ${file.name} troppo grande (max 10MB)`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.addUploadedFigure(file.name, e.target.result, file.type);
            };

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });

        Logger.info('Files uploaded', { count: files.length });
    },

    addUploadedFigure(name, data, type) {
        this.figureCount++;
        const figure = {
            id: this.figureCount,
            name: name,
            type: type,
            data: data,
            caption: `Figura ${this.figureCount} — ${name}`,
            source: 'upload'
        };

        this.figures.push(figure);
        this.renderFigure(figure);
        this.updateFigureList();

        UI.toast(`Figura ${this.figureCount} caricata`, 'success');
    },

    loadFigures() {
        // Carica figure generate
        const generated = [
            {
                id: 1,
                name: 'vista-prospettica.svg',
                type: 'image/svg+xml',
                caption: 'Figura 1 — Vista prospettica',
                source: 'generated'
            },
            {
                id: 2,
                name: 'sezione-dettaglio.svg',
                type: 'image/svg+xml',
                caption: 'Figura 2 — Sezione dettaglio',
                source: 'generated'
            }
        ];

        this.figures = generated;
        Storage.set('figures', this.figures);
    },

    renderFigure(figure) {
        // Aggiungi alla grid se necessario
        Logger.info('Figure rendered', { id: figure.id });
    },

    updateFigureList() {
        const container = document.getElementById('figures-container');
        if (!container) return;

        container.innerHTML = this.figures.map(fig => `
            <div class="figure-item">
                <div class="figure-thumb">🖼️</div>
                <div class="figure-info">
                    <h4>${fig.caption}</h4>
                    <p>${fig.source === 'generated' ? 'SVG generato' : 'File caricato'} • ${fig.name}</p>
                </div>
                <div class="figure-actions">
                    <button onclick="DisegnaBot.editFigure(${fig.id})" title="Modifica">✏️</button>
                    <button onclick="DisegnaBot.deleteFigure(${fig.id})" title="Elimina">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    regenerateSVG(id) {
        Logger.info('SVG regeneration requested', { id });

        // Simula rigenerazione
        const preview = document.getElementById(`svg-${id}`);
        if (preview) {
            preview.style.opacity = '0.5';
            setTimeout(() => {
                preview.style.opacity = '1';
                UI.toast(`Figura ${id} rigenerata`, 'success');
            }, 1500);
        }
    },

    downloadSVG(id) {
        const svg = document.getElementById(`svg-${id}`)?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        Utils.downloadBlob(blob, `figura-${id}.svg`);

        Logger.info('SVG downloaded', { id });
    },

    editFigure(id) {
        const figure = this.figures.find(f => f.id === id);
        if (!figure) return;

        UI.modal('Modifica Figura', `
            <div class="form-group">
                <label>Didascalia</label>
                <textarea id="edit-caption" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border); border-radius: var(--radius); font-family: var(--font);">${figure.caption}</textarea>
            </div>
            <div class="modal-actions">
                <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">Annulla</button>
                <button class="btn btn-primary" onclick="DisegnaBot.saveEdit(${id})">Salva</button>
            </div>
        `);
    },

    saveEdit(id) {
        const caption = document.getElementById('edit-caption').value;
        const figure = this.figures.find(f => f.id === id);
        if (figure) {
            figure.caption = caption;
            this.updateFigureList();
            Storage.set('figures', this.figures);
            UI.toast('Figura aggiornata', 'success');
        }
        document.querySelector('.modal-overlay')?.remove();
    },

    deleteFigure(id) {
        UI.confirm('Sei sicuro di voler eliminare questa figura?', () => {
            this.figures = this.figures.filter(f => f.id !== id);
            this.updateFigureList();
            Storage.set('figures', this.figures);
            UI.toast('Figura eliminata', 'success');
        });
    },

    addFigure() {
        this.figureCount++;
        const newId = this.figureCount;

        // Crea nuova card
        const grid = document.getElementById('draw-grid');
        const card = document.createElement('div');
        card.className = 'draw-card';
        card.innerHTML = `
            <h3>🎨 Figura ${newId} — Nuova Vista</h3>
            <div class="svg-preview" id="svg-${newId}">
                <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
                    <rect x="40" y="30" width="120" height="80" rx="8" fill="none" stroke="#003366" stroke-width="2"/>
                    <circle cx="100" cy="70" r="30" fill="none" stroke="#00C853" stroke-width="2"/>
                    <text x="100" y="140" text-anchor="middle" font-size="10" fill="#666">Fig. ${newId} — Nuova vista</text>
                </svg>
            </div>
            <div class="draw-caption">
                <label for="caption-${newId}">Didascalia</label>
                <textarea id="caption-${newId}" placeholder="Descrivi la figura...">Figura ${newId} — Nuova vista dell'oggetto.</textarea>
            </div>
            <div class="draw-actions">
                <button class="btn btn-outline" onclick="DisegnaBot.regenerateSVG(${newId})">🔄 Rigenera</button>
                <button class="btn btn-primary" onclick="DisegnaBot.downloadSVG(${newId})">⬇️ Scarica SVG</button>
            </div>
        `;

        grid.appendChild(card);

        this.figures.push({
            id: newId,
            name: `nuova-vista-${newId}.svg`,
            type: 'image/svg+xml',
            caption: `Figura ${newId} — Nuova vista`,
            source: 'generated'
        });

        this.updateFigureList();
        Storage.set('figures', this.figures);

        UI.toast(`Figura ${newId} aggiunta`, 'success');
        Logger.info('Figure added', { id: newId });
    },

    getFiguresForDocument() {
        return this.figures.map(fig => ({
            numero: fig.id,
            tipo: fig.type.includes('svg') ? 'svg' : 'image',
            contenuto: fig.data || fig.caption,
            didascalia: fig.caption
        }));
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    DisegnaBot.init();
});
