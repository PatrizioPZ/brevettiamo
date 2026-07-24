import sys

def test_security_rules():
    print("[*] Esecuzione Test di Sicurezza Login...")
    try:
        with open("login.py", "r", encoding="utf-8") as f:
            content = f.read()

        if "bcrypt" not in content and "hash" not in content:
            print("[-] ERRORE: Il codice usa password in chiaro! Sicurezza fallita.")
            return False

        print("[+] Test di Sicurezza Superato: Hashing rilevato.")
        return True
    except FileNotFoundError:
        return True

if __name__ == "__main__":
    if not test_security_rules():
        sys.exit(1)