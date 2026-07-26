# SKILL: Flusso Servizi e Regista BrevettIAmo

## Contesto
BrevettIAmo ha 25 servizi. 23 sono testuali (HTML puro), 2 richiedono disegni (tavole tecniche + CAD).

## Regole assolute
- Ogni servizio ha il suo file .html dedicato
- Regista (regista.html) gestisce il flusso ma NON contiene i servizi
- Niente pagine "universali" che mostrano tutti i servizi insieme
- Login -&gt; Welcome -&gt; Servizi (scelta) -&gt; Pagina dedicata del servizio

## Flusso corretto
1. index.html -&gt; login
2. login -&gt; welcome.html (privacy, NDA, manleva)
3. welcome -&gt; servizi.html (lista 25 servizi, cliccabili)
4. servizio cliccato -&gt; pagina dedicata (es. descrizione-invenzione.html)
5. Pagina servizio: descrizione -&gt; elaborazione -&gt; revisione -&gt; scarica

## Regista
- regista.html e un dashboard admin, NON la pagina dei servizi
- Mostra stato pratiche, flusso attivo, gestione
- Non sostituisce servizi.html

## File servizi testuali (esempi)
- descrizione-invenzione.html
- ricerca-prior-art.html
- redazione-rivendicazioni.html
- ... (23 totali)

## File servizi disegni
- tavole-tecniche.html (con SVG generator)
- disegno-cad.html (futuro)
