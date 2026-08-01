#!/usr/bin/env python3
"""
CEO Orchestrator v4.0 — BrevettIAmo Brain
Sistema Multi-Agente: 6 Cappelli di De Bono
CEO assume dipendenti, assegna compiti, arricchisce skills automaticamente.
"""

import os
import sys
import json
import base64
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

# ============ 6 CAPPelli DE BONO — AGENTI ============
AGENTS = {
    "ceo": {
        "cappello": "Blu",
        "ruolo": "Controllo e coordinamento",
        "skill": "Gestisce il team, assegna compiti, verifica qualita, arricchisce skills",
        "colore": "#1a3a5c"
    },
    "frontend": {
        "cappello": "Rosso",
        "ruolo": "Emozioni, UX e interfaccia",
        "skill": "HTML, CSS, JavaScript, responsive design, accessibilita, animazioni",
        "colore": "#c62828"
    },
    "backend": {
        "cappello": "Bianco",
        "ruolo": "Dati, fatti e logica",
        "skill": "API REST, database, autenticazione, sync cloud, Supabase",
        "colore": "#f5f5f5"
    },
    "security": {
        "cappello": "Nero",
        "ruolo": "Critica, rischi e sicurezza",
        "skill": "Cifratura AES-256, PBKDF2, CORS, XSS, CSRF, validazione input",
        "colore": "#212121"
    },
    "tester": {
        "cappello": "Giallo",
        "ruolo": "Ottimismo, opportunita e QA",
        "skill": "Test funzionali, cross-browser, mobile, performance, user testing",
        "colore": "#f9a825"
    },
    "creative": {
        "cappello": "Verde",
        "ruolo": "Creativita e innovazione",
        "skill": "Nuove feature, UX innovativa, gamification, onboarding, micro-interazioni",
        "colore": "#2e7d32"
    }
}

# ============ API PROVIDERS ============
def call_deepseek(prompt, max_retries=2):
    if not DEEPSEEK_API_KEY:
        return None, "DeepSeek API key mancante"
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "deepseek-chat", "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 8000}
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"], None
            print(f"[CEO] DeepSeek HTTP {resp.status_code}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] DeepSeek exc: {e}")
            time.sleep(2 ** attempt)
    return None, "DeepSeek fallito"

def call_openrouter(prompt, max_retries=2):
    if not OPENROUTER_API_KEY:
        return None, "OpenRouter API key mancante"
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://brevettiamo.com", "X-Title": "BrevettIAmo-CEO"}
    models = ["deepseek/deepseek-chat-v3-0324:free", "meta-llama/llama-4-maverick:free", "google/gemini-2.5-flash-preview:free"]
    for model in models:
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 8000}
        for attempt in range(max_retries):
            try:
                resp = requests.post(url, headers=headers, json=payload, timeout=120)
                if resp.status_code == 200:
                    data = resp.json()
                    if "choices" in data and len(data["choices"]) > 0:
                        return data["choices"][0]["message"]["content"], None
                time.sleep(2 ** attempt)
            except Exception as e:
                print(f"[CEO] OpenRouter exc: {e}")
                time.sleep(2 ** attempt)
    return None, "OpenRouter fallito"

def call_groq(prompt, api_key, max_retries=2):
    if not api_key:
        return None, "Groq API key mancante"
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 8000}
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"], None
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
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2, "maxOutputTokens": 8000}}
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                data = resp.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    return data["candidates"][0]["content"]["parts"][0]["text"], None
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] Gemini exc: {e}")
            time.sleep(2 ** attempt)
    return None, "Gemini fallito"

def call_kimi(prompt, max_retries=2):
    if not KIMI_API_KEY:
        return None, "Kimi API key mancante"
    url = "https://api.moonshot.cn/v1/chat/completions"
    headers = {"Authorization": f"Bearer {KIMI_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "moonshot-v1-8k", "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 8000}
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"], None
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[CEO] Kimi exc: {e}")
            time.sleep(2 ** attempt)
    return None, "Kimi fallito"

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
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json().get("sha")
    return None

def create_or_update_file(path, content, message, branch=None):
    if branch is None:
        branch = TARGET_BRANCH
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    payload = {"message": message, "content": base64.b64encode(content.encode('utf-8')).decode('utf-8'), "branch": branch}
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

# ============ AGENT SYSTEM ============
class Agent:
    def __init__(self, name, role, skills, color):
        self.name = name
        self.role = role
        self.skills = skills
        self.color = color
        self.tasks_completed = 0
        self.errors_found = []

    def work(self, task_description, context=""):
        print(f"\n{'='*60}")
        print(f"AGENTE: {self.name} | Cappello: {self.role}")
        print(f"Skills: {self.skills}")
        print(f"{'='*60}")

        prompt = f"""Sei l'agente {self.name} di BrevettIAmo. Cappello {self.role}.
Skills: {self.skills}

COMPITO:
{task_description}

{context}

REGOLE:
1. Genera SOLO codice funzionante, completo, pronto per produzione
2. HTML: layout pergamena coerente BrevettIAmo, NO emoji, solo testo e icone SVG
3. JS: verifica sintassi, MAI 'var object.property', usa 'window.x = ...'
4. CSS: stili coerenti con design system esistente
5. Commenti in italiano
6. Codice autocontenuto e funzionante
7. File COMPLETI, non troncati
8. JS con var invece di let/const per compatibilita massima

Rispondi SOLO con il codice completo, senza spiegazioni prima o dopo.
"""
        code, provider = call_ai_with_fallback(prompt)
        if code:
            self.tasks_completed += 1
            print(f"[AGENTE {self.name}] Task completato con {provider}")
            return code
        else:
            self.errors_found.append("AI provider fallito")
            print(f"[AGENTE {self.name}] ERRORE: nessun provider disponibile")
            return None

    def review(self, code, aspect):
        print(f"\n[AGENTE {self.name}] REVIEW: {aspect}")
        prompt = f"""Sei l'agente {self.name} (Cappello {self.role}).
Skills: {self.skills}

REVISIONA questo codice per: {aspect}

{code[:5000]}

Rispondi con:
- OK se tutto corretto
- Lista di problemi trovati se ci sono errori
- Suggerimenti di miglioramento
"""
        result, _ = call_ai_with_fallback(prompt)
        return result or "Review non disponibile"

def hire_agents():
    """CEO assume i dipendenti"""
    print("\n" + "="*60)
    print("CEO: ASSUNZIONE TEAM MULTI-AGENTE")
    print("="*60)
    team = {}
    for key, config in AGENTS.items():
        if key == "ceo":
            continue
        agent = Agent(config["cappello"], config["ruolo"], config["skill"], config["colore"])
        team[key] = agent
        print(f"[CEO] Assunto: {agent.name} ({agent.role}) - Skills: {agent.skills[:50]}...")
    print(f"[CEO] Team completo: {len(team)} agenti assunti")
    return team

def enrich_skills(agent, new_skill):
    """CEO arricchisce skills di un agente"""
    agent.skills += " | " + new_skill
    print(f"[CEO] Skill arricchita per {agent.name}: +{new_skill}")

# ============ PWA PROFESSIONALE — TEAM WORK ============
def build_pwa_professional(team):
    """CEO coordina il team per costruire la PWA professionale"""
    print("\n" + "="*60)
    print("CEO: AVVIO PROGETTO PWA PROFESSIONALE")
    print("="*60)

    # FASE 1: BACKEND (Cappello Bianco) — Struttura dati e API
    print("\n--- FASE 1: BACKEND DEV (Cappello Bianco) ---")
    backend_task = """Crea la struttura dati e le funzioni JavaScript per:
1. Login con Netlify Identity (Google + email) — script gia incluso: https://identity.netlify.com/v1/netlify-identity-widget.js
2. Dopo login, user_id di Netlify diventa lo sync_id stabile
3. Password vault separata per cifratura AES-256 GCM con PBKDF2
4. Funzioni: deriveKey(password,salt), deriveSyncId(password), encryptData(plaintext,key), decryptData(ciphertext,iv,key)
5. Supabase client: URL https://jtekrvlmqnluvaiapmwb.supabase.co, anon key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZWtydmxtcW5sdXZhaWFwbXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMzkzOTMsImV4cCI6MjA5NTcxNTM5M30.q5KOpwaZkZEqJt8fDT8XQnsRWswacvhlPzXZ4pysWvQ
6. Upload su Supabase tabella pwa_files: sync_id TEXT, name, file_type, iv TEXT base64, encrypted_data TEXT base64, size, device, created_at
7. Download da Supabase con sync_id = user_id
8. Sync automatico ogni 30 secondi
9. IndexedDB locale per cache offline
10. Tutto in funzioni JavaScript con var, mai let/const

Genera SOLO le funzioni JavaScript, non l'HTML completo."""

    backend_code = team["backend"].work(backend_task)
    if not backend_code:
        print("[CEO] BACKEND FALLITO — abort")
        return None

    # FASE 2: SECURITY (Cappello Nero) — Verifica sicurezza
    print("\n--- FASE 2: SECURITY (Cappello Nero) ---")
    security_review = team["security"].review(backend_code, "sicurezza cifratura, CORS, XSS, validazione input, gestione errori")
    print(f"[SECURITY] {security_review[:500]}")

    # FASE 3: FRONTEND (Cappello Rosso) — UI/UX
    print("\n--- FASE 3: FRONTEND DEV (Cappello Rosso) ---")
    frontend_task = f"""Crea l'HTML e CSS completo per BrevettIAmo PWA professionale:

1. DOCTYPE html, lang="it", meta viewport, charset UTF-8
2. Head: title "BrevettIAmo PWA - Storage Sicuro", meta theme-color #1a3a5c, meta mobile-web-app-capable, apple-mobile-web-app-status-bar-style black-translucent
3. Script Netlify Identity: <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
4. Script Supabase: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
5. Design pergamena: sfondo gradient #f5f0e6 → #e8e0d0 → #d4c8b0, font Georgia/Times New Roman
6. Header: BrevettIAmo PWA, sottotitolo, badge BETA GRATUITA
7. Sezione Login: "Accedi con Google" — Netlify Identity, mostra nome utente dopo login
8. Sezione Installa: bottone Installa Ora per PWA
9. Sezione Dispositivi: Windows, Android, iOS, macOS, Linux con icone SVG
10. Sezione Caratteristiche: Sync Cloud, Cifratura AES-256, Upload Universale, Modifica Online, Nessuno Store
11. Sezione File: upload area drag&drop + click, lista file con nome, dimensione, data, device, bottoni Scarica/Elimina/Modifica
12. Editor inline per file testo (textarea overlay)
13. Pannello debug nascosto (bottone Mostra Debug)
14. Footer
15. CSS responsive: mobile <600px, desktop >1024px
16. NO emoji, solo icone SVG stroke-based
17. Colori: #1a3a5c (blu), #c9a84c (oro), #f5f0e6 (pergamena), #2c1810 (testo)
18. Stili CSS inline nell'head, NO file esterno

Genera SOLO HTML e CSS, non JavaScript."""

    frontend_code = team["frontend"].work(frontend_task)
    if not frontend_code:
        print("[CEO] FRONTEND FALLITO — abort")
        return None

    # FASE 4: CREATIVE (Cappello Verde) — UX innovativa
    print("\n--- FASE 4: CREATIVE (Cappello Verde) ---")
    creative_task = f"""Aggiungi miglioramenti UX alla PWA:
1. Onboarding per primo accesso: messaggio "Benvenuto in BrevettIAmo PWA"
2. Stati di sync visivi: icona che pulsa quando sincronizza
3. Toast notification per upload completato
4. Animazione drag&drop quando si trascina un file
5. Progress bar reale durante upload
6. Empty state carino quando non ci sono file

Genera SOLO CSS e piccoli snippet JS per queste feature."""

    creative_code = team["creative"].work(creative_task, f"CSS esistente:\n{frontend_code[:2000]}")

    # FASE 5: TESTER (Cappello Giallo) — QA e test
    print("\n--- FASE 5: TESTER (Cappello Giallo) ---")
    tester_review = team["tester"].review(backend_code + frontend_code, "cross-browser compatibility, mobile responsive, performance, error handling")
    print(f"[TESTER] {tester_review[:500]}")

    # FASE 6: CEO (Cappello Blu) — Assemblaggio finale
    print("\n--- FASE 6: CEO (Cappello Blu) — ASSEMBLAGGIO ---")

    assembly_task = f"""Assembla la PWA BrevettIAmo professionale completa e funzionante.

Hai a disposizione:

BACKEND CODE (funzioni JS):
{backend_code[:8000]}

FRONTEND CODE (HTML+CSS):
{frontend_code[:8000]}

CREATIVE CODE (UX extra):
{creative_code[:3000] if creative_code else 'Nessuno'}

ISTRUZIONI:
1. Crea UN UNICO file HTML completo con tutto inline
2. Inserisci il CSS nell'<head> dentro <style>
3. Inserisci tutto il JavaScript prima di </body> dentro <script>
4. Il JS deve usare var invece di let/const
5. MAI 'var object.property' — usa sempre 'window.x = ...'
6. Aggiungi service worker inline (blob)
7. Aggiungi manifest inline (data URI)
8. Il file deve essere autocontenuto, nessuna dipendenza esterna tranne Netlify e Supabase CDN
9. Codice completo, non troncato. Se lungo, continua senza abbreviare.
10. Verifica che tutte le funzioni siano definite prima di essere chiamate
11. Aggiungi commenti in italiano

Genera l'HTML COMPLETO e funzionante."""

    final_code, provider = call_ai_with_fallback(assembly_task)
    if not final_code:
        print("[CEO] ASSEMBLAGGIO FALLITO")
        return None

    print(f"[CEO] PWA assemblata con {provider}")

    # Pulizia
    final_code = final_code.strip()
    if final_code.startswith("```"):
        lines = final_code.split("\n")
        start = 1
        if lines[0].strip().startswith("```") and len(lines[0].strip()) > 3:
            start = 1
        final_code = "\n".join(lines[start:])
    if final_code.endswith("```"):
        lines = final_code.split("\n")
        final_code = "\n".join(lines[:-1])
    final_code = final_code.strip()

    return final_code

# ============ SUPABASE LOGGING ============
def log_to_supabase(level, message, details=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    url = f"{SUPABASE_URL}/rest/v1/ceo_logs"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"}
    payload = {"level": level, "message": message, "details": json.dumps(details, ensure_ascii=False) if details else None, "created_at": datetime.now().isoformat()}
    try:
        requests.post(url, headers=headers, json=payload, timeout=10)
    except Exception as e:
        print(f"[CEO] Log fallito: {e}")

# ============ MAIN ============
def main():
    print("="*60)
    print("CEO ORCHESTRATOR v4.0 — Multi-Agente De Bono")
    print("Assume dipendenti, coordina, arricchisce skills")
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
    print(f"[CEO] Provider disponibili: {', '.join(avail) if avail else 'NESSUNO'}")

    # ASSUMI TEAM
    team = hire_agents()

    # ARRICCHISCI SKILLS
    enrich_skills(team["backend"], "Netlify Identity integration, OAuth2 flow")
    enrich_skills(team["frontend"], "PWA manifest, service worker, install prompt")
    enrich_skills(team["security"], "Row Level Security, SQL injection prevention")
    enrich_skills(team["tester"], "Automated regression testing, Lighthouse CI")
    enrich_skills(team["creative"], "Micro-interactions, skeleton screens, dark mode")

    # COSTRUISCI PWA
    final_code = build_pwa_professional(team)

    if not final_code:
        print("\n[CEO] PROGETTO FALLITO")
        log_to_supabase("error", "PWA build failed", {"team_size": len(team)})
        sys.exit(1)

    # SALVA SU GITHUB
    msg = f"ceo: PWA professionale multi-agente v4.0 | Team: {len(team)} agenti | {len(final_code)} chars"
    success = create_or_update_file("pwa.html", final_code, msg)

    # REPORT TEAM
    print("\n" + "="*60)
    print("REPORT TEAM")
    print("="*60)
    for name, agent in team.items():
        print(f"{agent.name} ({agent.role}): {agent.tasks_completed} task, {len(agent.errors_found)} errori")

    if success:
        print("\n[CEO] PROGETTO COMPLETATO E COMMITTATO")
        log_to_supabase("info", "PWA build completed", {"team_size": len(team), "chars": len(final_code)})
        sys.exit(0)
    else:
        print("\n[CEO] COMMIT FALLITO")
        log_to_supabase("error", "PWA commit failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
