// js/image-generator.js — Generatore immagini via proxy DALL-E 3

class ImageGenerator {
    constructor() {
        this.proxyUrl = CONFIG.IMAGE_PROXY_URL;
    }
    
    /**
     * Genera immagine da prompt testuale
     * @param {string} prompt - Prompt in inglese per DALL-E
     * @param {string} size - '1024x1024', '1024x1792', '1792x1024'
     * @param {string} style - 'vivid' o 'natural'
     * @returns {Promise<Object>} - { success, url, revisedPrompt, errore }
     */
    async genera(prompt, size = '1024x1024', style = 'vivid') {
        try {
            console.log('Generazione immagine con prompt:', prompt.substring(0, 50) + '...');
            
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    size: size,
                    style: style
                })
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'Errore generazione immagine');
            }
            
            const data = await response.json();
            
            return {
                success: true,
                url: data.url,
                revisedPrompt: data.revised_prompt,
                created: data.created
            };
            
        } catch (error) {
            console.error('Errore ImageGenerator:', error);
            return {
                success: false,
                errore: error.message
            };
        }
    }
    
    /**
     * Estrae prompt immagine dal testo IA generato
     * Cerca pattern: "Prompt EN:", "Prompt per immagine:", etc.
     */
    static estraiPrompt(testoIA) {
        // Pattern 1: <strong>Prompt EN:</strong> testo
        let match = testoIA.match(/Prompt\s*(?:EN|per immagine):<\/strong>\s*([^<]+)/i);
        if (match) return match[1].trim();
        
        // Pattern 2: Prompt EN: testo (senza HTML)
        match = testoIA.match(/Prompt\s*(?:EN|per immagine):\s*([^\n<]+)/i);
        if (match) return match[1].trim();
        
        // Pattern 3: qualsiasi testo in inglese dopo "3D render" o "photorealistic"
        match = testoIA.match(/(3D render|photorealistic|product photography)[^.]*\./i);
        if (match) return match[0].trim();
        
        // Fallback: cerca testo tra virgolette che sembra un prompt
        match = testoIA.match(/["']([^"']{50,200})["']/);
        if (match) return match[1].trim();
        
        return null;
    }
}

// Esporta
if (typeof window !== 'undefined') {
    window.ImageGenerator = ImageGenerator;
}
