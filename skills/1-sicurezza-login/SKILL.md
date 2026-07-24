# Competenza: Sicurezza e Gestione Login
Attivati ogni volta che nel task.json viene richiesto un sistema di autenticazione, login o registrazione.

## Regole Tassative di Sviluppo:
1. Non salvare MAI le password in chiaro nel database o nei file di configurazione.
2. Usa sempre algoritmi di hashing sicuri (es. bcrypt o pbkdf2).
3. Implementa blocchi per prevenire attacchi Brute Force.
4. Forza la Sandbox a eseguire lo script 'test_login.py' per verificare che il login rifiuti password errate.