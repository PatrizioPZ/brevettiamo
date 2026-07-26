## KEYWORDS: api, backend, supabase, groq, openrouter, edge, function, fetch, chiave, secret, provider, token
# SKILL: API e Backend BrevettIAmo

## Contesto
Sistema dual-IA con catena di fallback. Edge Functions su Supabase. Chiavi in GitHub Secrets.

## Provider API (ordine di priorita)
1. Groq (GROQ_API_KEY) - piu stabile e veloce
2. Groq 2 (GROQ_API_KEY_2) - backup
3. Kimi (KIMI_API_KEY) - cinese, veloce
4. Gemini (GEMINI_API_KEY) - Google, gratuito
5. OpenRouter (OPENROUTER_API_KEY) - aggregatore, modelli free

## Regole
- Chiavi solo da environment variables (os.getenv), MAI hardcoded
- Compressione zip per payload grandi
- Timeout 30 secondi sulle chiamate
- Retry automatico su provider fallback
- Risposta in JSON quando possibile

## Edge Functions Supabase
- call-ai-tavole-v2: generazione tavole SVG
- call-ai-prior-art: ricerca prior art
- call-ai-rivendicazioni: redazione rivendicazioni
- Tutte in TypeScript/Deno

## Frontend
- Chiama Edge Functions via fetch()
- Gestione errori con fallback a localStorage
- Niente chiavi API nel frontend (solo Supabase anon key)
