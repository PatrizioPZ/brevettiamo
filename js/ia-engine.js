// js/ia-engine.js - Motore IA per BrevettIAmo
// Usa Groq API per analisi e generazione

const IAEngine = {
    config: {
        groqUrl: 'https://api.groq.com/openai/v1/chat/completions',
        modello: 'llama-3.1-8b-instant',
        maxTokens: 4000,
        temperature: 0.7
    },

    async chiamaGroq(messaggi, apiKey) {
        if (!apiKey) {
            throw new Error('API Key Groq non configurata');
        }

        const response = await fetch(this.config.groqUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.config.modello,
                messages: messaggi,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error('Errore Groq: ' + response.status + ' - ' + error);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async analizzaDescrizione(descrizione, apiKey) {
        const messaggi = [
            {
                role: 'system',
                content: 'Sei un esperto di brevetti. Analizza la descrizione tecnica e restituisci: 1) Titolo brevetto, 2) Abstract, 3) Rivendicazioni principali, 4) Classificazione tecnica, 5) Keywords. Rispondi in italiano in formato JSON.'
            },
            {
                role: 'user',
                content: 'Analizza questa invenzione: ' + descrizione
            }
        ];

        const risposta = await this.chiamaGroq(messaggi, apiKey);

        try {
            return JSON.parse(risposta);
        } catch (e) {
            return {
                titolo: 'Invenzione',
                abstract: risposta.substring(0, 500),
                rivendicazioni: ['Rivendicazione principale'],
                classificazione: 'Non classificato',
                keywords: ['invenzione']
            };
        }
    },

    async generaTavoleSVG(descrizione, apiKey) {
        const messaggi = [
            {
                role: 'system',
                content: 'Sei un esperto di tavole tecniche brevettuali. Genera descrizioni SVG per le tavole di un brevetto. Per ogni tavola specifica: tipo (assieme/esplosa/sezione/dettaglio), oggetti geometrici (cilindri, coni, sfere, impugnature), posizioni e colori. Rispondi in formato JSON con array di tavole.'
            },
            {
                role: 'user',
                content: 'Genera tavole tecniche per: ' + descrizione
            }
        ];

        const risposta = await this.chiamaGroq(messaggi, apiKey);

        try {
            return JSON.parse(risposta);
        } catch (e) {
            return [
                {
                    tipo: 'assieme',
                    titolo: 'Vista d'assieme',
                    oggetti: [
                        { tipo: 'cilindro', x: 100, y: 100, raggio: 30, altezza: 100, colore: '#C5A059' }
                    ]
                }
            ];
        }
    },

    async ricercaPriorArt(descrizione, apiKey) {
        const messaggi = [
            {
                role: 'system',
                content: 'Sei un esperto di ricerca brevettuale. Analizza la descrizione e identifica: 1) Tecnologie simili esistenti, 2) Potenziali conflitti, 3) Strategie di brevettazione, 4) Mercati target. Rispondi in italiano in formato JSON.'
            },
            {
                role: 'user',
                content: 'Ricerca prior art per: ' + descrizione
            }
        ];

        const risposta = await this.chiamaGroq(messaggi, apiKey);

        try {
            return JSON.parse(risposta);
        } catch (e) {
            return {
                tecnologie_simili: [],
                conflitti: [],
                strategie: ['Procedere con deposito'],
                mercati: ['Italia', 'Europa']
            };
        }
    },

    async generaReport(descrizione, analisi, apiKey) {
        const messaggi = [
            {
                role: 'system',
                content: 'Sei un consulente brevettuale. Genera un report completo di brevettabilita includendo: 1) Analisi della novita, 2) Livello inventivo, 3) Applicabilita industriale, 4) Rischi, 5) Raccomandazioni. Rispondi in italiano.'
            },
            {
                role: 'user',
                content: 'Genera report per invenzione: ' + descrizione + '\nAnalisi: ' + JSON.stringify(analisi)
            }
        ];

        return await this.chiamaGroq(messaggi, apiKey);
    }
};

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.IAEngine = IAEngine;
}
