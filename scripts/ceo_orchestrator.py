import os
import json
import subprocess
import requests
import sys
import zipfile
import io
import re
from datetime import datetime

def log(msg):
    print(f"[CEO] {msg}", flush=True)

def run_command(command):
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    return result.stdout.strip(), result.returncode

def fetch_free_web_tokens_directory():
    try:
        response = requests.get("https://openrouter.ai/api/v1/models", timeout=15)
        if response.status_code == 200:
            models = response.json().get("data", [])
            free_models = [m["id"] for m in models if float(m.get("pricing", {}).get("prompt", 1)) == 0.0]
            if free_models:
                log(f"Modelli free trovati: {len(free_models)}")
                return free_models
    except Exception as e:
        log(f"Errore fetch modelli OpenRouter: {e}")
    return ["meta-llama/llama-3-8b-instruct:free", "microsoft/phi-3-medium-128k-instruct:free"]

def extract_keywords_from_skill(content):
    """Estrae keyword dalla riga ## KEYWORDS: ..."""
    kw_match = re.search(r'^## KEYWORDS:\s*(.+)$', content, re.MULTILINE | re.IGNORECASE)
    if kw_match:
        kw_text = kw_match.group(1).lower()
        return set(k.strip() for k in re.split(r'[,;]', kw_text) if k.strip())
    return set()

def discover_skills():
    """Scansiona skills/ (fisse + auto) e ritorna lista skill"""
    skills = []
    skills_dirs = ["skills"]

    # Aggiungi skills/auto/ se esiste
    if os.path.isdir("skills/auto"):
        skills_dirs.append("skills/auto")

    for base_dir in skills_dirs:
        if not os.path.isdir(base_dir):
            continue
        for item in sorted(os.listdir(base_dir)):
            item_path = os.path.join(base_dir, item)
            # Se e una cartella, cerca SKILL.md dentro
            if os.path.isdir(item_path):
                skill_file = os.path.join(item_path, "SKILL.md")
                if os.path.isfile(skill_file):
                    with open(skill_file, "r", encoding="utf-8") as f:
                        content = f.read()
                    keywords = extract_keywords_from_skill(content)
                    # Fallback: nome cartella
                    if not keywords:
                        keywords = set(item.lower().replace('_', '-').split('-'))
                    skills.append({
                        "path": skill_file,
                        "folder": item,
                        "base_dir": base_dir,
                        "keywords": keywords,
                        "content": content
                    })
            # Se e un file .md diretto in skills/auto/
            elif item.endswith(".md") and base_dir == "skills/auto":
                with open(item_path, "r", encoding="utf-8") as f:
                    content = f.read()
                keywords = extract_keywords_from_skill(content)
                if not keywords:
                    keywords = set(os.path.splitext(item)[0].lower().replace('_', '-').split('-'))
                skills.append({
                    "path": item_path,
                    "folder": os.path.splitext(item)[0],
                    "base_dir": base_dir,
                    "keywords": keywords,
                    "content": content
                })

    log(f"Skill totali scoperte: {len(skills)}")
    for s in skills:
        log(f"  - [{s['base_dir']}] {s['folder']}: keywords={sorted(s['keywords'])}")
    return skills

def load_skills_for_task(task_desc, all_skills):
    """Carica skill con keyword matching"""
    context = ""
    task_lower = task_desc.lower()
    loaded = []

    for skill in all_skills:
        if any(kw in task_lower for kw in skill["keywords"]):
            context += f"\n--- SKILL: {skill['folder']} ---\n{skill['content']}\n"
            loaded.append(skill["folder"])

    log(f"Skill attivate per questo task: {loaded}")
    return context

def auto_learn(task_desc, target_file, output_code, success):
    """
    Auto-apprendimento: dopo un task, l'agente genera una skill auto-appresa.
    Scrive in skills/auto/ per essere usata dalle IA future.
    """
    if not success:
        log("Auto-learn: task fallito, nessun apprendimento")
        return

    # Crea cartella skills/auto se non esiste
    auto_dir = "skills/auto"
    os.makedirs(auto_dir, exist_ok=True)

    # Genera nome file basato su data e target
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', target_file.replace('.', '_'))
    learn_file = os.path.join(auto_dir, f"{timestamp}_{safe_name}.md")

    # Estrai regole imparate dal codice
    learned_rules = []

    if target_file.endswith(".html"):
        if "<!DOCTYPE html>" in output_code:
            learned_rules.append("- File HTML deve iniziare con <!DOCTYPE html>")
        if "<html lang=\"it\">" in output_code or '<html lang="it">' in output_code:
            learned_rules.append("- HTML lang deve essere \"it\"")
        if "localStorage" in output_code:
            learned_rules.append("- Per storage locale usare localStorage con JSON.stringify/parse")
        if "dragover" in output_code or "ondragover" in output_code:
            learned_rules.append("- Drag-and-drop richiede gestione dragover, dragleave, drop")
        if "beforeinstallprompt" in output_code:
            learned_rules.append("- PWA install usa beforeinstallprompt e deferredPrompt")

    if target_file.endswith(".json"):
        learned_rules.append("- JSON deve essere valido con json.dumps/json.loads")

    if target_file.endswith(".py"):
        learned_rules.append("- Python: usare try/except per gestione errori API")

    # Se non ha imparato nulla di specifico, salta
    if not learned_rules:
        log("Auto-learn: nessuna regola nuova da apprendere")
        return

    # Genera keyword dal task
    task_words = set(re.findall(r'[a-zA-Z]{3,}', task_desc.lower()))
    common_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'che', 'per', 'una', 'con', 'del', 'nel', 'non', 'sono', 'della', 'alla', 'come', 'dopo', 'ogni', 'sotto', 'sopra', 'tra', 'fra', 'questo', 'questa', 'tutto', 'tutti', 'deve', 'deve', 'essere', 'file', 'codice', 'crea', 'compito', 'task'}
    keywords = sorted(task_words - common_words)[:10]

    # Scrivi skill appresa
    skill_content = f"""# SKILL AUTO-APPRESA: {target_file}

## KEYWORDS: {', '.join(keywords)}

## Data apprendimento: {datetime.now().strftime("%Y-%m-%d %H:%M")}

## Task originale
{task_desc[:300]}...

## Regole apprese
{'\n'.join(learned_rules)}

## Esempio applicazione
File target: `{target_file}`

```
{output_code[:500]}...
```

## Note per IA future
- Questa regola e stata appresa automaticamente dal CEO Orchestrator
- Verificare sempre con sandbox prima di applicare
- Aggiornare se si scoprono eccezioni
"""

    with open(learn_file, "w", encoding="utf-8") as f:
        f.write(skill_content)

    log(f"Auto-learn: skill appresa salvata in {learn_file}")
    log(f"Auto-learn: regole apprese: {len(learned_rules)}")

def clean_ai_output(text, target_file):
    text = text.strip()
    text = re.sub(r'```(?:json|html|css|js|javascript|python|xml)?\s*\n?', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\n?```', '', text)

    lines = text.split('\n')
    code_lines = []
    for line in lines:
        stripped = line.strip().lower()
        if stripped.startswith('ecco') or stripped.startswith('qui') or stripped.startswith('di seguito'):
            continue
        if stripped.startswith('il codice') or stripped.startswith('il file') or stripped.startswith('certo'):
            continue
        code_lines.append(line)

    text = '\n'.join(code_lines).strip()
    return text

def run_the_guardian_sandbox(target_file, task_desc):
    if not os.path.exists(target_file):
        return False, f"File {target_file} non creato"

    if target_file.endswith(".py"):
        try:
            with open(target_file, "r", encoding="utf-8") as f:
                code_content = f.read()
            compile(code_content, target_file, 'exec')
            log("Sandbox: compile Python OK")
        except Exception as e:
            return False, f"Fallito controllo compile(): {str(e)}"

    if target_file.endswith(".json"):
        try:
            with open(target_file, "r", encoding="utf-8") as f:
                json.load(f)
            log("Sandbox: JSON valido OK")
        except Exception as e:
            return False, f"JSON non valido: {str(e)}"

    if target_file.endswith(".html"):
        try:
            with open(target_file, "r", encoding="utf-8") as f:
                content = f.read()
            checks = [
                ("<!DOCTYPE html>" in content or "<!doctype html>" in content.lower(), "Manca DOCTYPE html"),
                ("<html" in content, "Manca tag html"),
                ("</html>" in content, "Manca chiusura html"),
                ("<body>" in content or "<body " in content, "Manca tag body"),
                ("</body>" in content, "Manca chiusura body"),
            ]
            for ok, msg in checks:
                if not ok:
                    return False, msg
            log("Sandbox: HTML struttura OK")
        except Exception as e:
            return False, f"HTML errore: {str(e)}"

    return True, "Sistema integro. Sandbox verde."

def call_broker_api(prompt, system_instruction, priority, task_data):
    api_keys = task_data.get("api_keys", {})
    kimi_key = api_keys.get("KIMI_API_KEY") or os.getenv("KIMI_API_KEY")
    gemini_key = api_keys.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    groq_key2 = os.getenv("GROQ_API_KEY_2", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    log(f"API — Kimi: {'SI' if kimi_key else 'NO'}, Gemini: {'SI' if gemini_key else 'NO'}, OpenRouter: {'SI' if openrouter_key else 'NO'}, Groq: {'SI' if groq_key else 'NO'}, Groq2: {'SI' if groq_key2 else 'NO'}, OpenAI: {'SI' if openai_key else 'NO'}")

    if groq_key:
        try:
            log("Provo Groq...")
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                json={"model": "llama3-8b-8192", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}], "temperature": 0.1},
                timeout=60
            )
            if res.status_code == 200:
                log("Groq OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"Groq errore HTTP {res.status_code}: {res.text[:300]}")
        except Exception as e:
            log(f"Groq exception: {e}")

    if groq_key2:
        try:
            log("Provo Groq 2...")
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key2}", "Content-Type": "application/json"},
                json={"model": "llama3-8b-8192", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}], "temperature": 0.1},
                timeout=60
            )
            if res.status_code == 200:
                log("Groq 2 OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"Groq 2 errore HTTP {res.status_code}: {res.text[:300]}")
        except Exception as e:
            log(f"Groq 2 exception: {e}")

    if kimi_key:
        try:
            log("Provo Kimi...")
            res = requests.post(
                "https://api.moonshot.cn/v1/chat/completions",
                headers={"Authorization": f"Bearer {kimi_key}", "Content-Type": "application/json"},
                json={"model": "moonshot-v1-8k", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}], "temperature": 0.1},
                timeout=60
            )
            if res.status_code == 200:
                log("Kimi OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"Kimi errore HTTP {res.status_code}: {res.text[:300]}")
        except Exception as e:
            log(f"Kimi exception: {e}")

    if gemini_key:
        try:
            log("Provo Gemini...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": f"{system_instruction}\n\nTask: {prompt}"}]}]}, timeout=60)
            if res.status_code == 200:
                log("Gemini OK")
                return res.json()['candidates'][0]['content']['parts'][0]['text']
            else:
                log(f"Gemini errore HTTP {res.status_code}: {res.text[:300]}")
        except Exception as e:
            log(f"Gemini exception: {e}")

    if openai_key:
        try:
            log("Provo OpenAI...")
            res = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                json={"model": "gpt-3.5-turbo", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}], "temperature": 0.1},
                timeout=60
            )
            if res.status_code == 200:
                log("OpenAI OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"OpenAI errore HTTP {res.status_code}: {res.text[:300]}")
        except Exception as e:
            log(f"OpenAI exception: {e}")

    if openrouter_key:
        free_models = fetch_free_web_tokens_directory()
        for model in free_models:
            try:
                log(f"Provo OpenRouter: {model}...")
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openrouter_key}", "Content-Type": "application/json"},
                    json={"model": model, "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}], "temperature": 0.1},
                    timeout=60
                )
                if res.status_code == 200:
                    log(f"OpenRouter OK con {model}")
                    return res.json()['choices'][0]['message']['content']
                else:
                    log(f"OpenRouter {model} errore HTTP {res.status_code}: {res.text[:300]}")
            except Exception as e:
                log(f"OpenRouter {model} exception: {e}")

    raise Exception("Nessun provider API disponibile o funzionante.")

def fallback_create_file(target_file, task_desc):
    log("ATTIVO FALLBACK")

    if target_file == "manifest.json":
        content = json.dumps({
            "name": "BrevettIAmo", "short_name": "BrevettIAmo",
            "description": "Piattaforma brevetti intelligente",
            "start_url": "/", "display": "standalone",
            "background_color": "#1a1a2e", "theme_color": "#16213e",
            "orientation": "portrait",
            "icons": [
                {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
                {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"}
            ]
        }, indent=2)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(content)
        log(f"Fallback: creato {target_file}")
        return True

    if target_file == "pwa.html":
        content = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>BrevettIAmo - Spazio File</title><style>body{font-family:sans-serif;background:#1a1a2e;color:#e0e0e0;max-width:900px;margin:0 auto;padding:20px}header{text-align:center;padding:20px 0;border-bottom:2px solid #0f3460;margin-bottom:20px}h1{margin:0}.subtitle{color:#a0a0c0;font-style:italic}.drop-zone{border:3px dashed #0f3460;border-radius:16px;padding:40px;text-align:center;margin:20px 0;cursor:pointer}.drop-zone:hover{border-color:#4a90d9}.file-list{display:grid;gap:10px}.file-card{background:#16213e;border:1px solid #0f3460;border-radius:8px;padding:12px;display:flex;gap:10px;align-items:center}.file-info{flex:1}.file-name{font-weight:bold}.file-meta{font-size:0.8rem;color:#a0a0c0}.btn{padding:8px 16px;border:none;border-radius:6px;cursor:pointer}.btn-danger{background:#8b0000;color:#fff}footer{text-align:center;padding:20px;color:#a0a0c0;font-size:0.8rem;border-top:1px solid #0f3460;margin-top:20px}</style></head><body><header><h1>BrevettIAmo</h1><p class="subtitle">Spazio File Personale</p></header><div style="display:flex;justify-content:space-between;margin-bottom:20px"><a href="servizi.html" style="color:#e0e0e0;text-decoration:none">&larr; Torna ai Servizi</a><button id="installBtn" style="display:none;padding:8px 16px;background:#1a5a3a;color:#fff;border:none;border-radius:6px;cursor:pointer">Installa App</button></div><div class="drop-zone" id="dropZone"><p><strong>Carica File</strong></p><p style="color:#a0a0c0;font-size:0.9rem">Trascina qui o clicca per selezionare</p><input type="file" id="fileInput" style="display:none" multiple></div><h2 style="border-bottom:1px solid #0f3460;padding-bottom:8px;margin-bottom:15px">I Tuoi File</h2><div class="file-list" id="fileList"><p style="text-align:center;color:#a0a0c0;padding:30px">Nessun file caricato</p></div><footer><p>BrevettIAmo - Spazio File Personale</p><p>Versione Beta v1.0</p></footer><script>(function(){var files=JSON.parse(localStorage.getItem("brevettiamo_files")||"[]");var dropZone=document.getElementById("dropZone");var fileInput=document.getElementById("fileInput");var fileList=document.getElementById("fileList");function render(){if(files.length===0){fileList.innerHTML='<p style="text-align:center;color:#a0a0c0;padding:30px">Nessun file caricato</p>';return}fileList.innerHTML="";files.forEach(function(f,i){var div=document.createElement("div");div.className="file-card";div.innerHTML='<div class="file-info"><div class="file-name">'+f.name+'</div><div class="file-meta">'+f.size+' &bull; '+(f.type||"file")+' &bull; '+(f.date||"")+'</div></div><button class="btn btn-danger" onclick="del('+i+')">Elimina</button>';fileList.appendChild(div);});}window.del=function(i){if(!confirm("Eliminare?"))return;files.splice(i,1);localStorage.setItem("brevettiamo_files",JSON.stringify(files));render()};function handle(fl){Array.from(fl).forEach(function(file){var reader=new FileReader();reader.onload=function(e){files.push({name:file.name,size:file.size+" B",type:file.type||"file",date:new Date().toLocaleString("it-IT"),data:e.target.result});localStorage.setItem("brevettiamo_files",JSON.stringify(files));render();};reader.readAsDataURL(file);});}dropZone.onclick=function(){fileInput.click()};dropZone.ondragover=function(e){e.preventDefault();dropZone.style.borderColor="#4a90d9"};dropZone.ondragleave=function(){dropZone.style.borderColor="#0f3460"};dropZone.ondrop=function(e){e.preventDefault();dropZone.style.borderColor="#0f3460";handle(e.dataTransfer.files)};fileInput.onchange=function(e){handle(e.target.files)};var deferredPrompt;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").style.display="inline-block"});document.getElementById("installBtn").onclick=function(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null};render();})();</script></body></html>'
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(content)
        log(f"Fallback: creato {target_file}")
        return True

    log(f"Fallback: nessun template per {target_file}")
    return False

def main():
    log("CEO Orchestrator v3.1 avviato")

    if not os.path.exists("task.json"):
        log("task.json non trovato, creo file idle")
        default_task = {
            "status": "idle", "task_description": "nessun task",
            "kill_switch": False, "target_file": "output.py", "priority": "SLOW"
        }
        with open("task.json", "w", encoding="utf-8") as f:
            json.dump(default_task, f, indent=4)
        log("Nessun task da eseguire. Uscita.")
        sys.exit(0)

    with open("task.json", "r", encoding="utf-8") as f:
        task_data = json.load(f)

    log(f"Task status: {task_data.get('status', 'unknown')}, kill_switch: {task_data.get('kill_switch', False)}")

    if task_data.get("status") != "pending" or task_data.get("kill_switch") == True:
        log("Nessun task pending o kill_switch attivo. Uscita.")
        sys.exit(0)

    task_desc = task_data["task_description"]
    target_file = task_data.get("target_file", "output.py")
    priority = task_data.get("priority", "SLOW")

    log(f"Task: {task_desc[:100]}...")
    log(f"Target file: {target_file}, Priority: {priority}")

    # SCANSIONE DINAMICA SKILL (fisse + auto-apprese)
    all_skills = discover_skills()
    skill_context = load_skills_for_task(task_desc, all_skills)

    system_instruction = f"""Agisci come compilatore di codice. NON interpretare. NON spiegare. ESEGUI SOLO.

REGOLE ASSOLUTE:
1. Output SOLO codice sorgente puro. ZERO spiegazioni. ZERO markdown. ZERO commenti inutili.
2. Se il target e un file .html, produci HTML5 completo con DOCTYPE, html, head, body, script inline.
3. Se il target e un file .json, produci JSON valido.
4. Se il target e un file .py, produci Python valido.
5. NON includere testo prima o dopo il codice.
6. Inizia direttamente con il codice.

{skill_context}"""

    output_code = None
    api_error = None
    success = False

    try:
        log("Chiamo API...")
        output_code = call_broker_api(task_desc, system_instruction, priority, task_data)
        output_code = clean_ai_output(output_code, target_file)
        log(f"IA ha generato {len(output_code)} caratteri")

        if not output_code or len(output_code.strip()) < 50:
            raise Exception("Output IA troppo corto o vuoto")

        with open(target_file, "w", encoding="utf-8") as f:
            f.write(output_code)
        log(f"File scritto: {target_file}")
    except Exception as e:
        api_error = str(e)
        log(f"Errore API: {api_error}")

        if fallback_create_file(target_file, task_desc):
            log("Fallback riuscito")
            # Leggi il file fallback per auto-learn
            with open(target_file, "r", encoding="utf-8") as f:
                output_code = f.read()
            success = True
        else:
            log("Fallback fallito")
            task_data["status"] = "failed"
            task_data["analisi_funzionamento"] = f"Errore API: {api_error}"
            task_data.pop("api_keys", None)
            with open("task.json", "w", encoding="utf-8") as f:
                json.dump(task_data, f, indent=4)
            log("Task segnato come failed. Uscita con 0")
            sys.exit(0)

    # Sandbox
    sandbox_ok, test_log = run_the_guardian_sandbox(target_file, task_desc)
    if sandbox_ok:
        task_data["status"] = "completed"
        task_data["analisi_funzionamento"] = "Codice integrato con successo. Sandbox verde."
        log("Sandbox: PASS")
        success = True
        exit_code = 0
    else:
        task_data["status"] = "failed"
        task_data["analisi_funzionamento"] = f"Sandbox fallita: {test_log}"
        if os.path.exists(target_file):
            os.remove(target_file)
        log(f"Sandbox: FAIL - {test_log}")
        success = False
        exit_code = 0

    # AUTO-APPRENDIMENTO: scrive skill auto-appresa per IA future
    if success and output_code:
        auto_learn(task_desc, target_file, output_code, success)

    task_data.pop("api_keys", None)

    with open("task.json", "w", encoding="utf-8") as f:
        json.dump(task_data, f, indent=4)

    log(f"CEO Orchestrator completato. Exit: {exit_code}")
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
