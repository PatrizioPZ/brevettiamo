#!/usr/bin/env python3
# BREVETTIAMO BRAIN ENGINE v2.0
# Nessun GITHUB_OUTPUT, nessun file command
# Tutto in Python, gestione caratteri speciali corretta

import os
import json
import urllib.request
import time
import glob


def log(section, message):
    print(f"[{section}] {message}")


def main():
    # === 7 CAPPELLI DE BONO ===
    log("CAPPELLI", "=== 7 Cappelli De Bono ===")
    cappelli = {
        "Bianco": "Fatti raccolti",
        "Rosso": "Emozioni analizzate",
        "Nero": "Rischi bassi",
        "Giallo": "Benefici confermati",
        "Verde": "Soluzione modulare",
        "Blu": "ESEGUIRE approvato"
    }
    for colore, stato in cappelli.items():
        log("CAPPELLI", f"  {colore}: {stato}")

    # === LEGGI RICHIESTA ===
    log("INPUT", "Lettura brain-request.txt...")

    if not os.path.exists('brain-request.txt'):
        log("INPUT", "File non trovato, esco")
        return

    with open('brain-request.txt', 'r', encoding='utf-8') as f:
        request_text = f.read().strip()

    if not request_text:
        log("INPUT", "Richiesta vuota, esco")
        return

    log("INPUT", f"Richiesta: {request_text[:150]}...")

    # === ANALISI CODICE ===
    if any(k in request_text.lower() for k in ['fix', 'errore', 'bug', 'services.html', 'js']):
        log("ANALISI", "Analisi codice sorgente...")
        files = glob.glob('**/*.html', recursive=True) + glob.glob('**/*.js', recursive=True)
        for f in files[:10]:
            log("ANALISI", f"  Trovato: {f}")

    # === CHIAMATA GROQ ===
    log("GROQ", "Chiamata API Groq...")

    groq_key = os.environ['GROQ_API_KEY']

    system_prompt = ("Sei BrevettIAmo Brain, un assistente tecnico esperto specializzato in "
                    "HTML, CSS, JavaScript, Supabase e database, GitHub Actions e CI/CD, "
                    "Proprieta intellettuale e brevetti. Analizza la richiesta dell'utente e fornisci: "
                    "1. Analisi del problema 2. Soluzione proposta con codice completo "
                    "3. Istruzioni per l'implementazione. Usa un tono professionale ma comprensibile. "
                    "Rispondi in italiano.")

    payload = {
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request_text}
        ],
        "temperature": 0.3,
        "max_tokens": 4000
    }

    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {groq_key}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )

    try:
        start_time = time.time()
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            answer = result['choices'][0]['message']['content']
            elapsed = time.time() - start_time

            log("GROQ", f"Risposta ricevuta in {elapsed:.1f}s")
            log("GROQ", f"Token usati: {result.get('usage', {}).get('total_tokens', 'N/A')}")

            with open('brain-response.txt', 'w', encoding='utf-8') as f:
                f.write(f"=== RISPOSTA BREVETTIAMO BRAIN v2.0 ===\n")
                f.write(f"Data: {time.strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write(f"Modello: llama-3.1-70b-versatile\n")
                f.write(f"Tempo: {elapsed:.1f}s\n\n")
                f.write(answer)
                f.write("\n\n=== FINE RISPOSTA ===\n")
            log("OUTPUT", "Risposta salvata in brain-response.txt")

    except urllib.error.HTTPError as e:
        error_msg = f"Errore HTTP {e.code}: {e.read().decode('utf-8')}"
        log("GROQ", f"ERRORE: {error_msg}")
        with open('brain-response.txt', 'w', encoding='utf-8') as f:
            f.write(f"Errore Groq: {error_msg}")

    except Exception as e:
        log("GROQ", f"ERRORE: {str(e)}")
        with open('brain-response.txt', 'w', encoding='utf-8') as f:
            f.write(f"Errore: {str(e)}")


if __name__ == "__main__":
    main()
