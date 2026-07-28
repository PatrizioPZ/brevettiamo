#!/usr/bin/env python3
"""
CEO Orchestrator v3.5 - BrevettIAmo Brain
Compressione ZIP + DeepSeek V3 + Fallback Multi-Provider
"""

import os
import sys
import json
import base64
import zipfile
import time
import requests
from datetime import datetime

# ============ CONFIGURAZIONE ============
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
KIMI_API_KEY = os.environ.get("KIMI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_KEY_2 = os.environ.get("GROQ_API_KEY_2", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

REPO_OWNER = "PatrizioPZ"
REPO_NAME = "brevettiamo"
TARGET_BRANCH = os.environ.get("TARGET_BRANCH", "main")


# ============ COMPRESSIONE ZIP ============
def compress_string(text: str) -> str:
    """Comprime una stringa con zlib+base64"""
    if not text:
        return ""
    try:
        compressed = zipfile.zlib.compress(text.encode('utf-8'), level=9)
        return base64.b64encode(compressed).decode('utf-8')
    except Exception as e:
        print(f"[CEO] Errore compressione: {e}")
        return text


def decompress_string(compressed: str) -> str:
    """Decomprime da base64+zlib"""
    if not compressed:
        return ""
    try:
        decoded = base64.b64decode(compressed.encode('utf-8'))
        return zipfile.zlib.decompress(decoded).decode('utf-8')
    except Exception:
        return compressed


# ============ API PROVIDERS ============
def call_deepseek(prompt, max_retries=2):
    if not DEEPSEEK_API_KEY:
        return None, "DeepSeek API key mancante"
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 8000
    }
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"], None
            print(f"[CEO] DeepSeek HTTP {resp.status_code}: {resp.text[:200]}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] DeepSeek exc: {e}")
            time.sleep(2 ** attempt)
    return None, "DeepSeek fallito"


def call_openrouter(prompt, max_retries=2):
    if not OPENROUTER_API_KEY:
        return None, "OpenRouter API key mancante"
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://brevettiamo.com",
        "X-Title": "BrevettIAmo-CEO"
    }
    models = [
        "deepseek/deepseek-chat-v3-0324:free",
        "meta-llama/llama-4-maverick:free",
        "google/gemini-2.5-flash-preview:free",
        "mistralai/mistral-7b-instruct:free"
    ]
    for model in models:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 8000
        }
        for attempt in range(max_retries):
            try:
                resp = requests.post(url, headers=headers, json=payload, timeout=120)
                if resp.status_code == 200:
                    data = resp.json()
                    if "choices" in data and len(data["choices"]) > 0:
                        return data["choices"][0]["message"]["content"], None
                print(f"[CEO] OpenRouter {model} HTTP {resp.status_code}")
                time.sleep(2 ** attempt)
            except Exception as e:
                print(f"[CEO] OpenRouter exc: {e}")
                time.sleep(2 ** attempt)
    return None, "OpenRouter fallito"


def call_groq(prompt, api_key, max_retries=2):
    if not api_key:
        return None, "Groq API key mancante"
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 8000
    }
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"], None
            print(f"[CEO] Groq HTTP {resp.status_code}: {resp.text[:200]}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] Groq exc: {e}")
            time.sleep(2 ** attempt)
    return None, "Groq fallito"


def call_gemini(prompt, max_retries=2):
    if not GEMINI_API_KEY:
        return None, "Gemini API key mancante"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 8000}
    }
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                data = resp.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    return data["candidates"][0]["content"]["parts"][0]["text"], None
            print(f"[CEO] Gemini HTTP {resp.status_code}: {resp.text[:200]}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] Gemini exc: {e}")
            time.sleep(2 ** attempt)
    return None, "Gemini fallito"


def call_kimi(prompt, max_retries=2):
    if not KIMI_API_KEY:
        return None, "Kimi API key mancante"
    url = "https://api.moonshot.cn/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {KIMI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "moonshot-v1-8k",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 8000
    }
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"], None
            print(f"[CEO] Kimi HTTP {resp.status_code}: {resp.text[:200]}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] Kimi exc: {e}")
            time.sleep(2 ** attempt)
    return None, "Kimi fallito"


# ============ FALLBACK CHAIN ============
def call_ai_with_fallback(prompt):
    providers = [
        ("DeepSeek", lambda p: call_deepseek(p)),
        ("OpenRouter", lambda p: call_openrouter(p)),
        ("Groq-1", lambda p: call_groq(p, GROQ_API_KEY)),
        ("Groq-2", lambda p: call_groq(p, GROQ_API_KEY_2)),
        ("Gemini", lambda p: call_gemini(p)),
        ("Kimi", lambda p: call_kimi(p)),
    ]
    for name, fn in providers:
        print(f"[CEO] Provo {name}...")
        result, err = fn(prompt)
        if result:
            print(f"[CEO] OK: {name}")
            return result, name
        print(f"[CEO] Fallito {name}: {err}")
    return None, "Tutti i provider falliti"


# ============ GITHUB OPERATIONS ============
def get_file_sha(path, branch=None):
    if branch is None:
        branch = TARGET_BRANCH
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}?ref={branch}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json().get("sha")
    return None


def create_or_update_file(path, content, message, branch=None):
    if branch is None:
        branch = TARGET_BRANCH
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode('utf-8')).decode('utf-8'),
        "branch": branch
    }
    sha = get_file_sha(path, branch)
    if sha:
        payload["sha"] = sha
        print(f"[CEO] Aggiorno: {path}")
    else:
        print(f"[CEO] Creo: {path}")
    resp = requests.put(url, headers=headers, json=payload)
    if resp.status_code in [200, 201]:
        print(f"[CEO] Commit OK: {path}")
        return True
    print(f"[CEO] ERRORE GitHub {resp.status_code}: {resp.text[:500]}")
    return False


# ============ TASK PROCESSING ============
def build_system_prompt(task, context=""):
    prompt = f"""Sei il CEO Orchestrator di BrevettIAmo. Genera codice completo e funzionante.

TASK: {task}

REGOLE ASSOLUTE:
1. Genera SOLO codice funzionante, completo, pronto per produzione
2. HTML: layout pergamena coerente BrevettIAmo, NO emoji, solo testo e icone SVG
3. JS: verifica sintassi, MAI 'var object.property', usa 'window.x = ...'
4. CSS: stili coerenti con design system esistente
5. Commenti in italiano
6. Codice autocontenuto e funzionante
7. File COMPLETI, non troncati. Se lungo, continua senza abbreviare.
8. Per tavole tecniche SVG: ogni figura (assieme/esplosa/sezione/dettaglio) deve avere layout visivamente distinti

{context}

Rispondi SOLO con il codice completo del file, senza spiegazioni prima o dopo. Non usare markdown ``` all'inizio e alla fine.
"""
    return prompt


def clean_generated_code(code):
    """Pulisce il codice generato dall'AI"""
    code = code.strip()
    if code.startswith("```"):
        lines = code.split("\n")
        start = 1
        if lines[0].strip().startswith("```") and len(lines[0].strip()) > 3:
            start = 1
        code = "\n".join(lines[start:])
    if code.endswith("```"):
        lines = code.split("\n")
        code = "\n".join(lines[:-1])
    return code.strip()


def process_task(task_data):
    task = task_data.get("task", "")
    file_path = task_data.get("file_path", "")
    file_type = task_data.get("file_type", "html")

    print(f"\n{'='*60}")
    print(f"TASK: {task[:100]}")
    print(f"FILE TARGET: {file_path or 'DA DETERMINARE'}")
    print(f"{'='*60}")

    prompt = build_system_prompt(task)
    code, provider = call_ai_with_fallback(prompt)

    if not code:
        print("[CEO] ERRORE: Nessun provider disponibile")
        return False

    code = clean_generated_code(code)
    print(f"[CEO] Codice generato: {len(code)} chars da {provider}")

    if not file_path:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"generated/ceo_{ts}.{file_type}"

    msg = f"ceo: {task[:60]}... | {provider}"
    return create_or_update_file(file_path, code, msg)


# ============ SUPABASE LOGGING ============
def log_to_supabase(level, message, details=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    url = f"{SUPABASE_URL}/rest/v1/ceo_logs"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    payload = {
        "level": level,
        "message": message,
        "details": json.dumps(details, ensure_ascii=False) if details else None,
        "created_at": datetime.now().isoformat()
    }
    try:
        requests.post(url, headers=headers, json=payload, timeout=10)
    except Exception as e:
        print(f"[CEO] Log fallito: {e}")


# ============ MAIN ============
def main():
    print("="*60)
    print("CEO ORCHESTRATOR v3.5")
    print("DeepSeek + ZIP + Fallback Multi-Provider")
    print("="*60)

    if not GITHUB_TOKEN:
        print("[CEO] ERRORE CRITICO: GITHUB_TOKEN mancante")
        sys.exit(1)

    avail = []
    if DEEPSEEK_API_KEY: avail.append("DeepSeek")
    if OPENROUTER_API_KEY: avail.append("OpenRouter")
    if GROQ_API_KEY: avail.append("Groq-1")
    if GROQ_API_KEY_2: avail.append("Groq-2")
    if GEMINI_API_KEY: avail.append("Gemini")
    if KIMI_API_KEY: avail.append("Kimi")
    print(f"[CEO] Provider: {', '.join(avail) if avail else 'NESSUNO'}")

    task_json = os.environ.get("CEO_TASK", "{}")
    task_data = {}
    try:
        task_data = json.loads(task_json)
    except:
        pass

    if not task_data and os.path.exists("task.json"):
        with open("task.json", "r", encoding="utf-8") as f:
            task_data = json.load(f)

    if not task_data or not task_data.get("task"):
        task_data = {
            "task": "Verifica che il CEO Orchestrator v3.5 funzioni generando un file di test",
            "file_path": "test/ceo_v35_test.html",
            "file_type": "html"
        }

    print(f"[CEO] Task: {json.dumps(task_data, ensure_ascii=False)[:300]}")

    success = process_task(task_data)

    if success:
        print("\n[CEO] TASK COMPLETATO")
        log_to_supabase("info", "Task completato", task_data)
        sys.exit(0)
    else:
        print("\n[CEO] TASK FALLITO")
        log_to_supabase("error", "Task fallito", task_data)
        sys.exit(1)


if __name__ == "__main__":
    main()
