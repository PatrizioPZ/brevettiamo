#!/usr/bin/env python3
"""
BREVETTIAMO - Update Brain
Script per estrarre brevetti italiani approvati dall'EPO e aggiornare
la banca dati contesto_ai.json usata da Groq per la valutazione disegni.
"""

import datetime
import json
import os
import sys
import time
import requests

EPO_API_URL = "https://ops.epo.org/3.2/rest-services/published-data/search"
EPO_AUTH_URL = "https://ops.epo.org/3.2/auth/accesstoken"
OUTPUT_FILE = "data/contesto_ai.json"
MAX_RISULTATI = 100
ANNI_STORICO = 5
EPO_CONSUMER_KEY = os.environ.get("EPO_CONSUMER_KEY", "")
EPO_CONSUMER_SECRET = os.environ.get("EPO_CONSUMER_SECRET", "")

def ottieni_token_epo():
    if not EPO_CONSUMER_KEY or not EPO_CONSUMER_SECRET:
        print("ERRORE: Credenziali EPO mancanti")
        return None
    try:
        r = requests.post(EPO_AUTH_URL, auth=(EPO_CONSUMER_KEY, EPO_CONSUMER_SECRET),
                         data={"grant_type": "client_credentials"}, timeout=30)
        r.raise_for_status()
        return r.json()["access_token"]
    except Exception as e:
        print(f"Errore auth EPO: {e}")
        return None

def cerca_brevetti_it(token, anno_inizio, anno_fine, range_inizio=1):
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    query = f"pn=IT and pd within {anno_inizio} {anno_fine}"
    params = {"q": query, "Range": f"{range_inizio}-{range_inizio + 24}"}
    try:
        r = requests.get(EPO_API_URL, headers=headers, params=params, timeout=60)
        if r.status_code == 401:
            return None
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Errore EPO: {e}")
        return None

def estrai_dati_brevetto(doc):
    try:
        biblio = doc.get("bibliographic-data", {})
        titoli = biblio.get("invention-title", [])
        titolo = "N/A"
        if isinstance(titoli, list) and titoli:
            titolo = titoli[0].get("$", "N/A")
        elif isinstance(titoli, dict):
            titolo = titoli.get("$", "N/A")
        doc_num = biblio.get("publication-reference", {})
        doc_id = doc_num.get("document-id", [{}])[0]
        numero = doc_id.get("doc-number", "N/A")
        date = doc_id.get("date", "N/A")
        if date != "N/A":
            date = f"{date[:4]}-{date[4:6]}-{date[6:]}"
        classi = []
        ipcs = biblio.get("classifications-ipcr", {}).get("classification-ipcr", [])
        if not isinstance(ipcs, list):
            ipcs = [ipcs]
        for ipc in ipcs:
            if isinstance(ipc, dict):
                classi.append(ipc.get("text", ""))
        locarno = biblio.get("locarno-classification", {})
        locarno_class = ""
        if locarno:
            locs = locarno.get("locarno-class", [])
            if isinstance(locs, list) and locs:
                locarno_class = locs[0].get("text", "")
            elif isinstance(locs, dict):
                locarno_class = locs.get("text", "")
        link = f"https://worldwide.espacenet.com/patent/search?q=pn%3D{numero}"
        return {
            "titolo": titolo, "numero_brevetto": numero,
            "data_approvazione": date, "classificazioni": classi,
            "locarno": locarno_class, "disegni_url": link,
            "caratteristiche_approvate": [], "errori_comuni_evitati": []
        }
    except Exception as e:
        print(f"Errore estrazione: {e}")
        return None

def mappa_categoria_locarno(locarno_class):
    mapping = {"06-01": "06-01", "06-02": "06-01", "14-03": "14-03",
               "12-05": "12-05", "15-01": "15-01", "26-05": "26-05"}
    base = locarno_class[:5] if len(locarno_class) >= 5 else locarno_class
    return mapping.get(base, "altro")

def aggiorna_database(nuovi_brevetti):
    db = {"metadata": {}, "categorie": {}, "regole_generali_uibm": {}}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)
    db["metadata"]["ultimo_aggiornamento"] = datetime.datetime.now().isoformat()
    db["metadata"]["fonte"] = "EPO/UIBM"
    for brevetto in nuovi_brevetti:
        cat = mappa_categoria_locarno(brevetto.get("locarno", ""))
        if cat not in db["categorie"]:
            db["categorie"][cat] = {
                "nome": f"Categoria {cat}", "classe_locarno": cat,
                "classe_cpc": "", "esempi_approvati": [], "pattern_approvazione": {}
            }
        esistenti = [e["numero_brevetto"] for e in db["categorie"][cat]["esempi_approvati"]]
        if brevetto["numero_brevetto"] not in esistenti:
            db["categorie"][cat]["esempi_approvati"].append(brevetto)
    db["metadata"]["totale_categorie"] = len(db["categorie"])
    db["metadata"]["totale_brevetti"] = sum(
        len(cat["esempi_approvati"]) for cat in db["categorie"].values())
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    print(f"Aggiornati {db['metadata']['totale_brevetti']} brevetti")

def estrai_documenti(dati):
    try:
        wd = dati.get("ops:world-patent-data", {})
        bs = wd.get("ops:biblio-search", {})
        sr = bs.get("ops:search-result", {})
        if isinstance(sr, dict):
            docs = sr.get("ops:exchange-documents", [])
        elif isinstance(sr, list):
            docs = sr[0].get("ops:exchange-documents", []) if sr else []
        else:
            docs = []
        if not docs:
            return []
        return docs if isinstance(docs, list) else [docs]
    except Exception as e:
        print(f"Errore parsing: {e}")
        return []

def main():
    print("=" * 60)
    print("BREVETTIAMO - Update Brain v1.0")
    print("=" * 60)
    anno_corrente = datetime.datetime.now().year
    anno_inizio = anno_corrente - ANNI_STORICO
    print(f"Intervallo: {anno_inizio}-{anno_corrente}")
    token = ottieni_token_epo()
    if not token:
        print("Token EPO mancante")
        sys.exit(1)
    print("Token OK")
    tutti = []
    rstart = 1
    while rstart <= MAX_RISULTATI:
        print(f"Pagina {rstart}-{rstart + 24}...")
        dati = cerca_brevetti_it(token, anno_inizio, anno_corrente, rstart)
        if dati is None:
            token = ottieni_token_epo()
            if not token:
                break
            continue
        risultati = estrai_documenti(dati)
        if not risultati:
            print("Fine risultati")
            break
        for doc in risultati:
            b = estrai_dati_brevetto(doc)
            if b:
                tutti.append(b)
        print(f"Totali: {len(tutti)}")
        totali = wd.get("ops:biblio-search", {}).get("@total-result-count", "0") if (wd := dati.get("ops:world-patent-data", {})) else "0"
        try:
            if rstart + 24 >= int(totali):
                break
        except (ValueError, TypeError):
            break
        rstart += 25
        time.sleep(1)
    print(f"\nTotale estratti: {len(tutti)}")
    if tutti:
        aggiorna_database(tutti)
        print(f"Salvato in: {OUTPUT_FILE}")
    else:
        print("Nessun brevetto trovato")
    print("\nCompletato!")

if __name__ == "__main__":
    main()
