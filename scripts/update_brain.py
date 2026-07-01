#!/usr/bin/env python3
"""
BREVETTIAMO - Update Brain
Script per estrarre brevetti italiani approvati dall'EPO e aggiornare
la banca dati contesto_ai.json usata da Groq per la valutazione disegni.

Esecuzione: python scripts/update_brain.py
"""

import datetime
import json
import os
import sys
import time
import requests
from pathlib import Path

# Configurazione
EPO_API_URL = "https://ops.epo.org/3.2/rest-services/published-data/search"
EPO_AUTH_URL = "https://ops.epo.org/3.2/auth/accesstoken"
OUTPUT_FILE = "data/contesto_ai.json"
MAX_RISULTATI = 100  # Per esecuzione (EPO limita)
ANNI_STORICO = 5

# Credenziali EPO (da environment variables o file .env)
EPO_CONSUMER_KEY = os.environ.get("EPO_CONSUMER_KEY", "")
EPO_CONSUMER_SECRET = os.environ.get("EPO_CONSUMER_SECRET", "")


def ottieni_token_epo():
    """Ottiene token OAuth2 dall'EPO."""
    if not EPO_CONSUMER_KEY or not EPO_CONSUMER_SECRET:
        print("ERRORE: EPO_CONSUMER_KEY e EPO_CONSUMER_SECRET non configurati")
        print("Ottieni le credenziali su: https://developers.epo.org/")
        return None

    try:
        response = requests.post(
            EPO_AUTH_URL,
            auth=(EPO_CONSUMER_KEY, EPO_CONSUMER_SECRET),
            data={"grant_type": "client_credentials"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Errore autenticazione EPO: {e}")
        return None


def cerca_brevetti_it(token, anno_inizio, anno_fine, range_inizio=1):
    """Cerca brevetti italiani approvati nell'intervallo."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    # Query: paese IT, status granted, ultimi 5 anni
    query = f"pn=IT and pd within {anno_inizio} {anno_fine}"

    params = {
        "q": query,
        "Range": f"{range_inizio}-{range_inizio + 24}"  # 25 risultati per chiamata
    }

    try:
        response = requests.get(EPO_API_URL, headers=headers, params=params, timeout=60)

        if response.status_code == 401:
            print("Token scaduto, rinnovo...")
            return None  # Richiama con nuovo token

        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Errore richiesta EPO: {e}")
        return None


def estrai_dati_brevetto(doc):
    """Estrae dati rilevanti da un documento EPO."""
    try:
        biblio = doc.get("bibliographic-data", {})

        # Titolo
        titoli = biblio.get("invention-title", [])
        titolo = titoli[0]["$"] if isinstance(titoli, list) and titoli else "N/A"
        if isinstance(titoli, dict):
            titolo = titoli.get("$", "N/A")

        # Numero brevetto
        doc_num = biblio.get("publication-reference", {})
        doc_id = doc_num.get("document-id", [{}])[0]
        numero = doc_id.get("doc-number", "N/A")

        # Data
        date = doc_id.get("date", "N/A")
        if date != "N/A":
            date = f"{date[:4]}-{date[4:6]}-{date[6:]}"

        # Classificazioni
        classi = []
        ipcs = biblio.get("classifications-ipcr", {}).get("classification-ipcr", [])
        if not isinstance(ipcs, list):
            ipcs = [ipcs]
        for ipc in ipcs:
            if isinstance(ipc, dict):
                classi.append(ipc.get("text", ""))

        # Locarno (se presente)
        locarno = biblio.get("locarno-classification", {})
        locarno_class = ""
        if locarno:
            locs = locarno.get("locarno-class", [])
            if isinstance(locs, list) and locs:
                locarno_class = locs[0].get("text", "")
            elif isinstance(locs, dict):
                locarno_class = locs.get("text", "")

        # Link Espacenet
        link = f"https://worldwide.espacenet.com/patent/search?q=pn%3D{numero}"

        return {
            "titolo": titolo,
            "numero_brevetto": numero,
            "data_approvazione": date,
            "classificazioni": classi,
            "locarno": locarno_class,
            "disegni_url": link,
            "caratteristiche_approvate": [],  # Da popolare manualmente o con AI
            "errori_comuni_evitati": []
        }
    except Exception as e:
        print(f"Errore estrazione dati: {e}")
        return None


def mappa_categoria_locarno(locarno_class):
    """Mappa la classe Locarno alla categoria nel nostro database."""
    # Mappatura semplificata (da espandere)
    mapping = {
        "06-01": "06-01",  # Sedie
        "06-02": "06-01",  # Poltrone -> Sedie
        "14-03": "14-03",  # Telecomunicazioni
        "12-05": "12-05",  # Veicoli
        "15-01": "15-01",  # Macchine
        "26-05": "26-05",  # Illuminazione
    }

    # Estrai classe base (primi 5 caratteri)
    base = locarno_class[:5] if len(locarno_class) >= 5 else locarno_class
    return mapping.get(base, "altro")


def aggiorna_database(nuovi_brevetti):
    """Aggiorna il file JSON con i nuovi brevetti."""
    # Carica database esistente
    db = {"metadata": {}, "categorie": {}, "regole_generali_uibm": {}}

    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

    # Aggiorna metadata
    db["metadata"]["ultimo_aggiornamento"] = datetime.datetime.now().isoformat()
    db["metadata"]["fonte"] = "EPO/UIBM - Brevetti italiani approvati"

    # Aggiungi brevetti alle categorie
    for brevetto in nuovi_brevetti:
        cat = mappa_categoria_locarno(brevetto.get("locarno", ""))

        if cat not in db["categorie"]:
            db["categorie"][cat] = {
                "nome": f"Categoria {cat}",
                "classe_locarno": cat,
                "classe_cpc": "",
                "esempi_approvati": [],
                "pattern_approvazione": {}
            }

        # Evita duplicati
        esistenti = [e["numero_brevetto"] for e in db["categorie"][cat]["esempi_approvati"]]
        if brevetto["numero_brevetto"] not in esistenti:
            db["categorie"][cat]["esempi_approvati"].append(brevetto)

    # Aggiorna contatori
    db["metadata"]["totale_categorie"] = len(db["categorie"])
    db["metadata"]["totale_brevetti"] = sum(
        len(cat["esempi_approvati"]) for cat in db["categorie"].values()
    )

    # Salva
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    print(f"Database aggiornato: {db['metadata']['totale_brevetti']} brevetti in {db['metadata']['totale_categorie']} categorie")


def main():
    """Funzione principale."""
    print("=" * 60)
    print("BREVETTIAMO - Update Brain v1.0")
    print("Estrazione brevetti italiani approvati dall'EPO")
    print("=" * 60)

    # Calcola intervallo
    anno_corrente = datetime.datetime.now().year
    anno_inizio = anno_corrente - ANNI_STORICO
    print(f"Intervallo: {anno_inizio} - {anno_corrente}")

    # Ottieni token
    token = ottieni_token_epo()
    if not token:
        print("Impossibile ottenere token EPO. Uscita.")
        sys.exit(1)

    print("Token EPO ottenuto con successo")

    # Estrai brevetti (con paginazione)
    tutti_brevetti = []
    range_inizio = 1

    while range_inizio <= MAX_RISULTATI:
        print(f"Estrazione risultati {range_inizio}-{range_inizio + 24}...")

        dati = cerca_brevetti_it(token, anno_inizio, anno_corrente, range_inizio)

        if dati is None:
            # Token scaduto, rinnova
            token = ottieni_token_epo()
            if not token:
                break
            continue

        if "ops:world-patent-data" not in dati:
            print("Nessun dato trovato")
            break

        risultati = (dati["ops:world-patent-data"]
                    .get("ops:biblio-search", {})
                    .get("ops:search-result", [])
                    .get("ops:exchange-documents", []))

        if not risultati:
            break

        if not isinstance(risultati, list):
            risultati = [risultati]

        for doc in risultati:
            brevetto = estrai_dati_brevetto(doc)
            if brevetto:
                tutti_brevetti.append(brevetto)

        print(f"Estratti {len(tutti_brevetti)} brevetti totali")

        # Controlla se ci sono altri risultati
        totali = (dati["ops:world-patent-data"]
                 .get("ops:biblio-search", {})
                 .get("@total-result-count", "0"))

        if range_inizio + 24 >= int(totali):
            break

        range_inizio += 25
        time.sleep(1)  # Rispetta rate limit EPO

    print(f"
Totale brevetti estratti: {len(tutti_brevetti)}")

    # Aggiorna database
    if tutti_brevetti:
        aggiorna_database(tutti_brevetti)
        print(f"Database salvato in: {OUTPUT_FILE}")
    else:
        print("Nessun brevetto da aggiornare")

    print("
Aggiornamento completato!")


if __name__ == "__main__":
    main()
