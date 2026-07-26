# SKILL: PWA e Spazio File BrevettIAmo

## Contesto
BrevettIAmo e una piattaforma brevetti. La PWA e lo spazio file personale del cliente dopo il login.

## Regole assolute
- ZERO dipendenze esterne (no CDN, no framework)
- NO emoji, solo testo e icone SVG inline
- Tema scuro pergamena: sfondo #1a1a2e, card #16213e, accenti #0f3460, testo #e0e0e0
- Responsive mobile-first
- Tutto inline: HTML + CSS + JS nel file .html

## Struttura file pwa.html
1. DOCTYPE html, lang="it", charset UTF-8, viewport
2. Header: "BrevettIAmo" + sottotitolo "Spazio File Personale"
3. Top bar: pulsante "Torna ai Servizi" (link a servizi.html) + "Installa App"
4. Barra spazio utilizzato (visualizzazione percentuale)
5. Area drag-and-drop grande con bordo tratteggiato #0f3460
6. Lista file in card con: icona/anteprima, nome, dimensione, tipo, data, pulsante elimina
7. Salvataggio in localStorage come base64 (demo)
8. Footer: versione beta, info storage crittografato
9. JS inline alla fine del body

## Icone
- Usa solo SVG inline, niente font icon
- Immagini: anteprima thumbnail
- PDF/documenti: icona SVG generica documento
- Upload: icona SVG freccia su

## JavaScript
- Gestione dragover/dragleave/drop
- FileReader readAsDataURL per anteprime
- localStorage JSON per persistenza
- beforeinstallprompt per PWA install
- Funzione deleteFile con confirm()
- Formattazione dimensioni (B, KB, MB)
