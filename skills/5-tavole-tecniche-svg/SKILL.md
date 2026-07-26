# SKILL: Tavole Tecniche e Disegni SVG BrevettIAmo

## Contesto
Tavole tecniche per brevetti conformi UIBM. Disegni SVG vettoriali, non immagini raster.

## Regole assolute
- SVG puro, inline nel file HTML o come file .svg separato
- NO immagini PNG/JPG per i disegni tecnici
- Conforme UIBM: figure numerate, linee di riferimento, sezioni, viste multiple
- Tema coerente BrevettIAmo (colori #1a1a2e, #0f3460, #e0e0e0)

## Struttura tavola
1. Bordo rettangolare con margine
2. Intestazione: numero figura, titolo, scala
3. Disegno tecnico con linee #e0e0e0 su sfondo #1a1a2e
4. Linee di riferimento numerate
5. Legenda in basso
6. Firma/data in angolo

## Tipi di vista
- Assieme: tutti i componenti uniti
- Esplosa: componenti separati con linee di riferimento
- Sezione: taglio con tratteggio
- Dettaglio: zoom su parte specifica

## Parser semantico
Quando l'utente descrive un oggetto (es. "cacciavite a due punte"):
1. Identifica forme geometriche (cilindro, cono, sfera, impugnatura)
2. Genera SVG con path appropriati
3. Posiziona le forme secondo il tipo di vista
