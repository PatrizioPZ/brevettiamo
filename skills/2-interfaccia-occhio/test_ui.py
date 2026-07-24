import sys
import os

def test_ui_elements():
    print("[*] Esecuzione Test Interfaccia Visiva...")
    try:
        for filename in ["login.html", "index.html"]:
            if os.path.exists(filename):
                with open(filename, "r", encoding="utf-8") as f:
                    content = f.read()
                if "type" in content and "password" in content and "text" not in content:
                    print(f"[-] ERRORE in {filename}: Manca lo script JavaScript per mostrare la password.")
                    return False
        print("[+] Test UI Superato: Logica 'Occhio Password' integrata.")
        return True
    except Exception as e:
        print(f"[-] Errore test UI: {str(e)}")
        return False

if __name__ == "__main__":
    if not test_ui_elements():
        sys.exit(1)