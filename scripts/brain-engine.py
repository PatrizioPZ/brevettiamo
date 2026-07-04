#!/usr/bin/env python3
# BREVETTIAMO BRAIN ENGINE v2.0
# Chiama Groq dal server GitHub Actions

import os
import json
import urllib.request
import time
import glob


def log(section, message):
    print(f"[{section}] {message}")


def main():
    log("CAPPELLI", "=== 7 Cappelli De Bono ===")
    for colore, stato in {
        "Bianco": "Fatti raccolti",
        "Rosso": "Emozioni analizzate",
        "Nero": "Rischi bassi",
        "Giallo": "Benefici confermati",
        "Verde": "Soluzione modulare",
        "Blu": "ESEGUIRE approvato"
    }.items():
        log("CAPPELLI", f"  {colore}: {stato}")

    if not os.path.exists('brain-request.txt'):
        log("INPUT", "File non trovato, esco")
        return

    with open('brain-request.txt', 'r', encoding='utf-8') as f:
        request_text = f.read().strip()

    if not request_text:
        log("INPUT", "Richiesta vuota, esco")
        return

    log("INPUT", f"Richiesta: {request_text[:150]}...")

    if any(k in request_text.lower() for k in ['fix', 'errore', 'bug', 'services.html', 'js']):
        log("ANALISI", "Analisi codice sorgente...")
        for f in (glob.glob('**/*.html', recursive=True) + glob.glob('**/*.js', recursive=True))[:10]:
            log("ANALISI", f"  Trovato: {f}")

    log("GROQ", "Chiamata API Groq...")

    groq_key = os.environ['GROQ_API_KEY']

    system_prompt = ("Sei BrevettIAmo Brain, assistente tecnico esperto in HTML, CSS, JavaScript, "
                    "Supabase, GitHub Actions e proprieta intellettuale. "
                    "Analizza la richiesta e fornisci: 1. Analisi 2. Soluzione con codice 3. Istruzioni. "
                    "Rispondi in italiano.")

    payload = {
        "model": "llama-3.3-70b-versatile",
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
        start = time.time()
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            answer = result['choices'][0]['message']['content']
            elapsed = time.time() - start

            log("GROQ", f"Risposta in {elapsed:.1f}s")
            log("GROQ", f"Token: {result.get('usage', {}).get('total_tokens', 'N/A')}")

            with open('brain-response.txt', 'w', encoding='utf-8') as f:
                f.write(f"=== RISPOSTA BREVETTIAMO BRAIN v2.0 ===
")
                f.write(f"Data: {time.strftime('%d/%m/%Y %H:%M:%S')}
")
                f.write(f"Modello: llama-3.3-70b-versatile
")
                f.write(f"Tempo: {elapsed:.1f}s

")
                f.write(answer)
                f.write("

=== FINE RISPOSTA ===
")
            log("OUTPUT", "Risposta salvata in brain-response.txt")

    except Exception as e:
        log("GROQ", f"ERRORE: {str(e)}")
        with open('brain-response.txt', 'w', encoding='utf-8') as f:
            f.write(f"Errore: {str(e)}")


if __name__ == "__main__":
    main()
