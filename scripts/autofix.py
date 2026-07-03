#!/usr/bin/env python3
"""
Autofix BrevettIAmo - Script di autocorrezione con IA
Usa Groq per analisi rapida e Kimi per fix complessi
"""

import os
import sys
import json
import re
import requests

# Configurazione
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
KIMI_API_KEY = os.environ.get('KIMI_API_KEY', '')

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
KIMI_URL = "https://api.moonshot.cn/v1/chat/completions"

# File da monitorare
FILE_PATTERNS = [
    '*.html',
    '*.js',
    '*.css'
]

def call_groq(prompt, model="llama-3.1-8b-instant"):
    """Chiama Groq API per analisi rapida"""
    if not GROQ_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Sei un esperto di JavaScript e HTML. Analizza il codice e trova errori di sintassi, apostrofi non escapati, BOM, e problemi di encoding. Rispondi in italiano."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 2000
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=data, timeout=30)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"Groq errore {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Groq exception: {e}")
        return None

def call_kimi(prompt, model="moonshot-v1-8k"):
    """Chiama Kimi API per fix complessi"""
    if not KIMI_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {KIMI_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Sei un esperto sviluppatore web. Correggi errori di sintassi JavaScript, HTML, CSS. Attento a apostrofi, BOM, encoding UTF-8. Rispondi SOLO con il codice corretto, senza spiegazioni."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 4000
    }

    try:
        response = requests.post(KIMI_URL, headers=headers, json=data, timeout=60)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"Kimi errore {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Kimi exception: {e}")
        return None

def check_syntax_js(content):
    """Controlla errori di sintassi base in JS"""
    errors = []

    # Controlla BOM
    if content.startswith('\xef\xbb\xbf'):
        errors.append("BOM presente all'inizio del file")

    # Controlla apostrofi non escapati in stringhe
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        # Cerca pattern: 'testo con apostrofo non escapato'
        if "'" in line and "\\'" not in line:
            # Conta apostrofi
            count = line.count("'")
            escaped = line.count("\\'")
            actual = count - escaped
            if actual % 2 != 0:
                errors.append(f"Riga {i}: apostrofi non bilanciati")

    # Controlla var object.property (errore comune)
    if re.search(r'var\s+\w+\.\w+\s*=', content):
        errors.append("Trovato 'var object.property' - errore JS")

    return errors

def fix_file(filepath):
    """Corregge un file usando IA"""
    print(f"\nAnalizzando: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check sintassi base
    errors = check_syntax_js(content)

    if not errors:
        print(f"  ✓ Nessun errore rilevato")
        return False

    print(f"  ⚠ Errori trovati: {errors}")

    # Prova fix con Groq prima (veloce)
    prompt = f"""Correggi questo file JavaScript/HTML. Errori trovati: {errors}

File: {filepath}

```javascript
{content}
```

Rispondi SOLO con il codice corretto, senza spiegazioni, senza markdown."""

    fixed = call_groq(prompt)

    if not fixed:
        # Fallback a Kimi
        print(f"  → Groq non ha risposto, provo Kimi...")
        fixed = call_kimi(prompt)

    if fixed:
        # Rimuovi BOM se presente
        if fixed.startswith('\xef\xbb\xbf'):
            fixed = fixed[3:]

        # Salva file corretto
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)

        print(f"  ✓ File corretto!")
        return True
    else:
        print(f"  ✗ Nessuna correzione applicata")
        return False

def main():
    print("=" * 60)
    print("BrevettIAmo Autofix - Avvio")
    print("=" * 60)

    # Verifica API keys
    if not GROQ_API_KEY:
        print("⚠ GROQ_API_KEY non trovata")
    if not KIMI_API_KEY:
        print("⚠ KIMI_API_KEY non trovata")

    if not GROQ_API_KEY and not KIMI_API_KEY:
        print("✗ Nessuna API key configurata. Esco.")
        sys.exit(1)

    # Trova file da controllare
    import glob
    files_to_check = []

    for pattern in FILE_PATTERNS:
        files_to_check.extend(glob.glob(pattern, recursive=True))

    print(f"\nTrovati {len(files_to_check)} file da controllare")

    fixed_count = 0

    for filepath in files_to_check:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n{'=' * 60}")
    print(f"Risultato: {fixed_count} file corretti su {len(files_to_check)}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
