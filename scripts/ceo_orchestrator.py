import os
import json
import subprocess
import requests
import sys
import zipfile
import io

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
                return free_models
    except Exception:
        pass
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

def run_the_guardian_sandbox(target_file, task_desc):
    if target_file.endswith(".py"):
        try:
            with open(target_file, "r", encoding="utf-8") as f:
                code_content = f.read()
            compile(code_content, target_file, 'exec')
        except Exception as e:
            return False, f"Fallito controllo compile(): {str(e)}"

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
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "free")

    if priority == "URGENT" and gemini_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_key}"
        res = requests.post(url, json={"contents": [{"parts": [{"text": f"{system_instruction}\n\nTask: {prompt}"}]}]})
        if res.status_code == 200:
            return res.json()['candidates'][0]['content']['parts'][0]['text']

    if kimi_key:
        res = requests.post(
            "https://api.moonshot.cn/v1/chat/completions",
            headers={"Authorization": f"Bearer {kimi_key}"},
            json={"model": "moonshot-v1-8k", "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]}
        )
        if res.status_code == 200:
            return res.json()['choices'][0]['message']['content']

    free_models = fetch_free_web_tokens_directory()
    for model in free_models:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {openrouter_key}"},
            json={"model": model, "messages": [{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}]}
        )
        if res.status_code == 200:
            return res.json()['choices'][0]['message']['content']

    raise Exception("Nessun provider API disponibile o funzionante.")

def main():
    # FIX 1: se task.json non esiste, crea uno vuoto e esci senza errore
    if not os.path.exists("task.json"):
        default_task = {
            "status": "idle",
            "task_description": "nessun task",
            "kill_switch": False,
            "target_file": "output.py",
            "priority": "SLOW"
        }
        with open("task.json", "w", encoding="utf-8") as f:
            json.dump(default_task, f, indent=4)
        print("task.json creato con stato idle. Nessun task da eseguire.")
        sys.exit(0)

    with open("task.json", "r", encoding="utf-8") as f:
        task_data = json.load(f)

    if task_data.get("status") != "pending" or task_data.get("kill_switch") == True:
        print(f"Stato task: {task_data.get('status', 'unknown')}. Kill switch: {task_data.get('kill_switch', False)}. Uscita.")
        sys.exit(0)

    task_desc = task_data["task_description"]
    target_file = task_data.get("target_file", "output.py")
    priority = task_data.get("priority", "SLOW")

    skill_context = load_agno_skills_container(task_desc)
    system_instruction = f"Agisci come Senior Developer. Scrivi SOLO codice sorgente puro, senza spiegazioni, senza markdown.\n{skill_context}"

    try:
        output_code = call_broker_api(task_desc, system_instruction, priority, task_data)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(output_code)

        success, test_log = run_the_guardian_sandbox(target_file, task_desc)
        if success:
            task_data["status"] = "completed"
            task_data["analisi_funzionamento"] = "Codice integrato con successo. Sandbox verde."
            exit_code = 0
        else:
            task_data["status"] = "failed"
            task_data["analisi_funzionamento"] = f"Sandbox fallita: {test_log}"
            if os.path.exists(target_file):
                os.remove(target_file)
            exit_code = 1
    except Exception as e:
        task_data["status"] = "failed"
        task_data["analisi_funzionamento"] = f"Errore di sistema: {str(e)}"
        exit_code = 1

    with open("task.json", "w", encoding="utf-8") as f:
        json.dump(task_data, f, indent=4)

    # FIX 2: NON fare git operations - le gestisce il workflow YAML
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
