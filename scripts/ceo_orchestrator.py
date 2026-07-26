import os
import json
import subprocess
import requests
import sys
import zipfile
import io
import re

def log(msg):
    print(f"[CEO] {msg}", flush=True)

def run_command(command):
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    return result.stdout.strip(), result.returncode

def compress_files(files_dict):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for filename, content in files_dict.items():
            zf.writestr(filename, content)
    return zip_buffer.getvalue()

def decompress_files(zip_bytes):
    files_dict = {}
    with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
        for filename in zf.namelist():
            files_dict[filename] = zf.read(filename).decode('utf-8')
    return files_dict

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

def load_agno_skills_container(task_desc):
    context = ""
    if "login" in task_desc.lower() or "autenticazione" in task_desc.lower():
        if os.path.exists("skills/1-sicurezza-login/SKILL.md"):
            with open("skills/1-sicurezza-login/SKILL.md", "r", encoding="utf-8") as f:
                context += f.read() + "\n"
        if os.path.exists("skills/2-interfaccia-occhio/SKILL.md"):
            with open("skills/2-interfaccia-occhio/SKILL.md", "r", encoding="utf-8") as f:
                context += f.read() + "\n"
    if any(k in task_desc.lower() for k in ["safety", "office", "brevetto", "uibm"]):
        if os.path.exists("skills/3-conformita-brevetti/SKILL.md"):
            with open("skills/3-conformita-brevetti/SKILL.md", "r", encoding="utf-8") as f:
                context += f.read() + "\n"
    return context

def clean_ai_output(text):
    """Rimuove markdown e backticks dall'output dell'IA"""
    text = re.sub(r'```(?:json|html|css|js|javascript|python)?\s*\n?', '', text)
    text = re.sub(r'\n?```', '', text)
    text = text.strip()
    return text

def run_the_guardian_sandbox(target_file, task_desc):
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

    if "login" in task_desc.lower():
        if os.path.exists("skills/1-sicurezza-login/test_login.py"):
            out, code = run_command("python skills/1-sicurezza-login/test_login.py")
            if code != 0:
                return False, f"Violazione Hashing:\n{out}"
        if os.path.exists("skills/2-interfaccia-occhio/test_ui.py"):
            out, code = run_command("python skills/2-interfaccia-occhio/test_ui.py")
            if code != 0:
                return False, f"Violazione Occhio UI:\n{out}"

    return True, "Sistema integro. Sandbox verde."

def call_broker_api(prompt, system_instruction, priority, task_data):
    api_keys = task_data.get("api_keys", {})
    kimi_key = api_keys.get("KIMI_API_KEY") or os.getenv("KIMI_API_KEY")
    gemini_key = api_keys.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")

    log(f"API disponibili - Kimi: {'SI' if kimi_key else 'NO'}, Gemini: {'SI' if gemini_key else 'NO'}, OpenRouter: {'SI' if openrouter_key else 'NO'}, Groq: {'SI' if groq_key else 'NO'}")

    # 1. Prova Gemini (URGENT)
    if priority == "URGENT" and gemini_key:
        try:
            log("Provo Gemini...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": f"{system_instruction}\n\nTask: {prompt}"}]}]}, timeout=30)
            if res.status_code == 200:
                log("Gemini OK")
                return res.json()['candidates'][0]['content']['parts'][0]['text']
            else:
                log(f"Gemini errore HTTP {res.status_code}")
        except Exception as e:
            log(f"Gemini exception: {e}")

    # 2. Prova Kimi
    if kimi_key:
        try:
            log("Provo Kimi...")
            res = requests.post(
                "https://api.moonshot.cn/v1/chat/completions",
                headers={"Authorization": f"Bearer {kimi_key}", "Content-Type": "application/json"},
                json={"model": "moonshot-v1-8k", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]},
                timeout=30
            )
            if res.status_code == 200:
                log("Kimi OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"Kimi errore HTTP {res.status_code}: {res.text[:200]}")
        except Exception as e:
            log(f"Kimi exception: {e}")

    # 3. Prova Groq
    if groq_key:
        try:
            log("Provo Groq...")
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                json={"model": "llama3-8b-8192", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]},
                timeout=30
            )
            if res.status_code == 200:
                log("Groq OK")
                return res.json()['choices'][0]['message']['content']
            else:
                log(f"Groq errore HTTP {res.status_code}: {res.text[:200]}")
        except Exception as e:
            log(f"Groq exception: {e}")

    # 4. Prova OpenRouter free
    if openrouter_key:
        free_models = fetch_free_web_tokens_directory()
        for model in free_models:
            try:
                log(f"Provo OpenRouter model: {model}...")
                res = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openrouter_key}", "Content-Type": "application/json"},
                    json={"model": model, "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]},
                    timeout=30
                )
                if res.status_code == 200:
                    log(f"OpenRouter OK con {model}")
                    return res.json()['choices'][0]['message']['content']
                else:
                    log(f"OpenRouter {model} errore HTTP {res.status_code}: {res.text[:200]}")
            except Exception as e:
                log(f"OpenRouter {model} exception: {e}")

    raise Exception("Nessun provider API disponibile o funzionante.")

def fallback_create_file(target_file, task_desc):
    """Se tutte le IA falliscono, crea il file da template locale"""
    log("ATTIVO FALLBACK: creazione file da template")
    
    if target_file == "manifest.json":
        content = json.dumps({
            "name": "BrevettIAmo",
            "short_name": "BrevettIAmo",
            "description": "Piattaforma brevetti intelligente",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#1a1a2e",
            "theme_color": "#16213e",
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
    
    log(f"Fallback: nessun template per {target_file}")
    return False

def main():
    log("CEO Orchestrator avviato")
    
    if not os.path.exists("task.json"):
        log("task.json non trovato, creo file idle")
        default_task = {
            "status": "idle",
            "task_description": "nessun task",
            "kill_switch": False,
            "target_file": "output.py",
            "priority": "SLOW"
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

    log(f"Task: {task_desc[:80]}...")
    log(f"Target file: {target_file}, Priority: {priority}")

    skill_context = load_agno_skills_container(task_desc)
    system_instruction = f"Agisci come Senior Developer. Scrivi SOLO codice sorgente puro, senza spiegazioni, senza markdown.\n{skill_context}"

    output_code = None
    api_error = None
    
    try:
        output_code = call_broker_api(task_desc, system_instruction, priority, task_data)
        output_code = clean_ai_output(output_code)
        log(f"IA ha generato {len(output_code)} caratteri")
        
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(output_code)
        log(f"File scritto: {target_file}")
    except Exception as e:
        api_error = str(e)
        log(f"Errore API: {api_error}")
        
        # Fallback: prova a creare da template
        if fallback_create_file(target_file, task_desc):
            log("Fallback riuscito")
        else:
            log("Fallback fallito, nessun template disponibile")
            task_data["status"] = "failed"
            task_data["analisi_funzionamento"] = f"Errore API: {api_error}"
            task_data.pop("api_keys", None)  # <-- FIX SICUREZZA: rimuove api_keys
            with open("task.json", "w", encoding="utf-8") as f:
                json.dump(task_data, f, indent=4)
            log("Task segnato come failed. Uscita con 0 (non blocca il workflow)")
            sys.exit(0)

    # Sandbox
    success, test_log = run_the_guardian_sandbox(target_file, task_desc)
    if success:
        task_data["status"] = "completed"
        task_data["analisi_funzionamento"] = "Codice integrato con successo. Sandbox verde."
        log("Sandbox: PASS")
        exit_code = 0
    else:
        task_data["status"] = "failed"
        task_data["analisi_funzionamento"] = f"Sandbox fallita: {test_log}"
        if os.path.exists(target_file):
            os.remove(target_file)
        log(f"Sandbox: FAIL - {test_log}")
        exit_code = 0  # Non blocca il workflow, logga solo

    # FIX SICUREZZA: rimuove api_keys prima di salvare nel repo
    task_data.pop("api_keys", None)
    
    with open("task.json", "w", encoding="utf-8") as f:
        json.dump(task_data, f, indent=4)

    log(f"CEO Orchestrator completato. Exit: {exit_code}")
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
