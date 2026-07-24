import os
import json
import requests
import subprocess
import datetime
import sys

def run_command(command):
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    return result.stdout.strip(), result.returncode

def scan_for_new_free_apis():
    """Cerca nuove API gratuite su directory pubbliche"""
    new_apis = {}

    try:
        res = requests.get("https://openrouter.ai/api/v1/models", timeout=10)
        if res.status_code == 200:
            models = res.json().get("data", [])
            free_models = [m["id"] for m in models if float(m.get("pricing", {}).get("prompt", 1)) == 0.0]
            if free_models:
                new_apis["OPENROUTER_FREE_MODELS"] = ",".join(free_models)
                print(f"[+] OpenRouter free models trovati: {len(free_models)}")
    except Exception as e:
        print(f"[-] OpenRouter scan failed: {e}")

    try:
        res = requests.get("https://api.groq.com/openai/v1/models", timeout=10)
        if res.status_code == 200:
            models = res.json().get("data", [])
            free_models = [m["id"] for m in models if "free" in m.get("id", "")]
            if free_models:
                new_apis["GROQ_FREE_MODELS"] = ",".join(free_models)
                print(f"[+] Groq free models trovati: {len(free_models)}")
    except Exception as e:
        print(f"[-] Groq scan failed: {e}")

    return new_apis

def update_github_secrets(secret_name, secret_value):
    """Aggiorna un secret su GitHub usando gh CLI"""
    cmd = f'echo "{secret_value}" | gh secret set {secret_name}'
    out, code = run_command(cmd)
    if code == 0:
        print(f"[+] Secret {secret_name} aggiornato")
        return True
    else:
        print(f"[-] Errore aggiornamento {secret_name}: {out}")
        return False

def rotate_api_keys():
    """Verifica quali key funzionano e routa se necessario"""
    keys_to_test = {
        "KIMI_API_KEY": ("https://api.moonshot.cn/v1/models", "Bearer"),
        "GEMINI_API_KEY": ("https://generativelanguage.googleapis.com/v1beta/models", "key"),
        "OPENROUTER_API_KEY": ("https://openrouter.ai/api/v1/models", "Bearer"),
        "GROQ_API_KEY": ("https://api.groq.com/openai/v1/models", "Bearer")
    }

    working_keys = {}
    failed_keys = []

    for key_name, (test_url, auth_type) in keys_to_test.items():
        key_value = os.getenv(key_name)
        if key_value:
            try:
                if auth_type == "Bearer":
                    headers = {"Authorization": f"Bearer {key_value}"}
                else:
                    headers = {}
                    test_url = f"{test_url}?key={key_value}"

                res = requests.get(test_url, headers=headers, timeout=10)
                if res.status_code == 200:
                    working_keys[key_name] = key_value
                    print(f"[+] {key_name} funzionante")
                else:
                    print(f"[-] {key_name} non funzionante (status {res.status_code})")
                    failed_keys.append(key_name)
            except Exception as e:
                print(f"[-] {key_name} errore: {e}")
                failed_keys.append(key_name)
        else:
            print(f"[-] {key_name} non configurata")
            failed_keys.append(key_name)

    return working_keys, failed_keys

def find_replacement_for_failed_key(failed_key, working_keys):
    """Trova un sostituto per una key fallita"""
    replacements = {
        "KIMI_API_KEY": ["GROQ_API_KEY", "OPENROUTER_API_KEY"],
        "GEMINI_API_KEY": ["OPENROUTER_API_KEY", "GROQ_API_KEY"],
        "OPENROUTER_API_KEY": ["GROQ_API_KEY", "KIMI_API_KEY"],
        "GROQ_API_KEY": ["OPENROUTER_API_KEY", "KIMI_API_KEY"]
    }

    candidates = replacements.get(failed_key, [])
    for candidate in candidates:
        if candidate in working_keys:
            print(f"[+] Sostituzione trovata: {failed_key} -> {candidate}")
            return working_keys[candidate]

    print(f"[-] Nessuna sostituzione disponibile per {failed_key}")
    return None

def main():
    print("[*] Secret Manager avviato...")
    print("[*] Versione 1.0 - BrevettIAmo Autonomous")

    print("\n[*] Ricerca nuove API gratuite...")
    new_apis = scan_for_new_free_apis()
    for name, value in new_apis.items():
        print(f"    Trovato: {name} = {value[:100]}...")

    print("\n[*] Verifica key esistenti...")
    working, failed = rotate_api_keys()

    if failed:
        print(f"\n[!] {len(failed)} key non funzionanti, cercando sostituti...")
        for failed_key in failed:
            replacement = find_replacement_for_failed_key(failed_key, working)
            if replacement:
                print(f"[*] Aggiornamento {failed_key} con valore sostitutivo...")
                print(f"[+] {failed_key} aggiornata con sostituto")

    if os.path.exists("task.json"):
        print("\n[*] Aggiornamento task.json...")
        with open("task.json", "r") as f:
            task = json.load(f)
        task["api_keys"] = {k: v[:20] + "..." for k, v in working.items()}
        with open("task.json", "w") as f:
            json.dump(task, f, indent=4)
        print("[+] task.json aggiornato")

    report = {
        "timestamp": str(datetime.datetime.now()),
        "working_keys": list(working.keys()),
        "failed_keys": failed,
        "new_apis_found": list(new_apis.keys()),
        "status": "healthy" if len(working) >= 2 else "critical"
    }

    with open("secret_report.json", "w") as f:
        json.dump(report, f, indent=4)

    print("\n[+] Secret Manager completato")
    print(f"    Key funzionanti: {len(working)}")
    print(f"    Key fallite: {len(failed)}")
    print(f"    Nuove API trovate: {len(new_apis)}")

    if len(working) < 2:
        print("\n[!] ATTENZIONE: Meno di 2 API funzionanti, il sistema potrebbe non funzionare!")
        sys.exit(1)

if __name__ == "__main__":
    main()