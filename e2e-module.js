// ============================================================
// BREVETTIAMO E2E MODULE
// Crittografia end-to-end per tutto il sistema BrevettIAmo
// Versione: 1.0.0
// ============================================================

const BrevettIAmoE2E = (function() {
  'use strict';

  // ==================== CONFIGURAZIONE ====================
  const CONFIG = {
    GOOGLE_CLIENT_ID: '689549835018-mctd9d69079us2eqmjdqdaf3hdiogmij.apps.googleusercontent.com',
    DB_NAME: 'BrevettIAmoE2E',
    DB_VERSION: 1,
    PBKDF2_ITERATIONS: 100000,
    KEY_LENGTH: 256,
    SALT_LENGTH: 16,
    IV_LENGTH: 12
  };

  // ==================== STATO ====================
  let currentUser = null;
  let encryptionKey = null;
  let db = null;
  let isInitialized = false;

  // ==================== INIZIALIZZAZIONE ====================
  async function init() {
    if (isInitialized) return;

    console.log('[BrevettIAmoE2E] Inizializzazione...');

    // Controlla se utente già loggato
    const saved = localStorage.getItem('brevettiamo_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      try {
        await recoverKey();
        isInitialized = true;
        console.log('[BrevettIAmoE2E] Chiave recuperata. E2E attivo.');
        return true;
      } catch (e) {
        console.error('[BrevettIAmoE2E] Errore recupero chiave:', e);
        // Utente deve rifare login
        return false;
      }
    }

    console.log('[BrevettIAmoE2E] Nessun utente loggato. Attesa login.');
    return false;
  }

  // ==================== GOOGLE LOGIN ====================
  function handleGoogleLogin(response) {
    return new Promise((resolve, reject) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture
        };

        localStorage.setItem('brevettiamo_user', JSON.stringify(currentUser));

        // Genera chiave
        generateAndSaveKey().then(() => {
          isInitialized = true;
          console.log('[BrevettIAmoE2E] Login completato. E2E attivo.');
          resolve(currentUser);
        }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // ==================== GENERAZIONE CHIAVE ====================
  async function generateAndSaveKey() {
    const salt = crypto.getRandomValues(new Uint8Array(CONFIG.SALT_LENGTH));
    const rawKey = await deriveRawKey(currentUser.id, salt);

    encryptionKey = await crypto.subtle.importKey(
      'raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LENGTH));
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      rawKey
    );

    const db = await openDB();
    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    await storeRequest(store, 'put', {
      userId: currentUser.id,
      encryptedKey: Array.from(new Uint8Array(encryptedKey)),
      salt: Array.from(salt),
      iv: Array.from(iv),
      created: Date.now()
    });
  }

  async function recoverKey() {
    const db = await openDB();
    const tx = db.transaction('keys', 'readonly');
    const store = tx.objectStore('keys');
    const data = await storeRequest(store, 'get', currentUser.id);

    if (!data) {
      throw new Error('Chiave non trovata');
    }

    const salt = new Uint8Array(data.salt);
    const iv = new Uint8Array(data.iv);
    const encryptedKey = new Uint8Array(data.encryptedKey);

    const rawKey = await deriveRawKey(currentUser.id, salt);
    const tempKey = await crypto.subtle.importKey(
      'raw', rawKey, 'AES-GCM', false, ['decrypt']
    );

    const decryptedKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      tempKey,
      encryptedKey
    );

    encryptionKey = await crypto.subtle.importKey(
      'raw', new Uint8Array(decryptedKey), 'AES-GCM', false, ['encrypt', 'decrypt']
    );
  }

  async function deriveRawKey(googleId, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(googleId + 'BrevettIAmoE2E2026');

    const keyMaterial = await crypto.subtle.importKey(
      'raw', data, 'PBKDF2', false, ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: salt, iterations: CONFIG.PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      CONFIG.KEY_LENGTH
    );

    return new Uint8Array(derivedBits);
  }

  // ==================== INDEXEDDB ====================
  async function openDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Store chiavi
        if (!database.objectStoreNames.contains('keys')) {
          database.createObjectStore('keys', { keyPath: 'userId' });
        }

        // Store privacy
        if (!database.objectStoreNames.contains('privacy')) {
          database.createObjectStore('privacy', { keyPath: 'id', autoIncrement: true });
        }

        // Store NDA
        if (!database.objectStoreNames.contains('nda')) {
          database.createObjectStore('nda', { keyPath: 'id', autoIncrement: true });
        }

        // Store acquisti
        if (!database.objectStoreNames.contains('acquisti')) {
          database.createObjectStore('acquisti', { keyPath: 'id', autoIncrement: true });
        }

        // Store chat messaggi
        if (!database.objectStoreNames.contains('chat_messages')) {
          database.createObjectStore('chat_messages', { keyPath: 'id', autoIncrement: true });
        }

        // Store chat files
        if (!database.objectStoreNames.contains('chat_files')) {
          database.createObjectStore('chat_files', { keyPath: 'id', autoIncrement: true });
        }

        // Store disegni
        if (!database.objectStoreNames.contains('disegni')) {
          database.createObjectStore('disegni', { keyPath: 'id', autoIncrement: true });
        }

        // Store L'OCCHIO ricerche
        if (!database.objectStoreNames.contains('occhio_searches')) {
          database.createObjectStore('occhio_searches', { keyPath: 'id', autoIncrement: true });
        }

        // Store L'OCCHIO alert
        if (!database.objectStoreNames.contains('occhio_alerts')) {
          database.createObjectStore('occhio_alerts', { keyPath: 'id', autoIncrement: true });
        }

        // Store L'OCCHIO report
        if (!database.objectStoreNames.contains('occhio_reports')) {
          database.createObjectStore('occhio_reports', { keyPath: 'id', autoIncrement: true });
        }

        // Store pratiche
        if (!database.objectStoreNames.contains('pratiche')) {
          database.createObjectStore('pratiche', { keyPath: 'id', autoIncrement: true });
        }

        // Store documenti
        if (!database.objectStoreNames.contains('documenti')) {
          database.createObjectStore('documenti', { keyPath: 'id', autoIncrement: true });
        }

        // Store preferenze
        if (!database.objectStoreNames.contains('preferenze')) {
          database.createObjectStore('preferenze', { keyPath: 'userId' });
        }
      };
    });
  }

  function storeRequest(store, method, data) {
    return new Promise((resolve, reject) => {
      const request = store[method](data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== CRITTOGRAFIA TESTO ====================
  async function encryptText(plaintext) {
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      data
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      timestamp: Date.now()
    };
  }

  async function decryptText(encryptedObj) {
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const iv = new Uint8Array(encryptedObj.iv);
    const data = new Uint8Array(encryptedObj.data);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  // ==================== CRITTOGRAFIA FILE ====================
  async function encryptFile(fileBuffer) {
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      fileBuffer
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      timestamp: Date.now()
    };
  }

  async function decryptFile(encryptedObj) {
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const iv = new Uint8Array(encryptedObj.iv);
    const data = new Uint8Array(encryptedObj.data);
    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      data
    );
  }

  // ==================== SALVATAGGIO GENERICO ====================
  async function save(storeName, data) {
    if (!currentUser) throw new Error('Utente non loggato');
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    // Cifra i dati
    const jsonData = JSON.stringify(data);
    const encrypted = await encryptText(jsonData);

    // Salva in IndexedDB
    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    const record = {
      userId: currentUser.id,
      encryptedData: encrypted,
      created: Date.now()
    };

    // Se data ha un id, usalo
    if (data.id) {
      record.id = data.id;
    }

    return await storeRequest(store, 'add', record);
  }

  async function update(storeName, id, data) {
    if (!currentUser) throw new Error('Utente non loggato');

    const jsonData = JSON.stringify(data);
    const encrypted = await encryptText(jsonData);

    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    return await storeRequest(store, 'put', {
      id: id,
      userId: currentUser.id,
      encryptedData: encrypted,
      updated: Date.now()
    });
  }

  async function load(storeName, id) {
    if (!currentUser) throw new Error('Utente non loggato');
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const database = await openDB();
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    const record = await storeRequest(store, 'get', id);
    if (!record) return null;

    // Verifica proprietà
    if (record.userId !== currentUser.id) {
      throw new Error('Accesso negato');
    }

    // Decifra
    const decrypted = await decryptText(record.encryptedData);
    return JSON.parse(decrypted);
  }

  async function loadAll(storeName) {
    if (!currentUser) throw new Error('Utente non loggato');
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const database = await openDB();
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    const records = await storeRequest(store, 'getAll');
    const results = [];

    for (const record of records) {
      if (record.userId === currentUser.id) {
        try {
          const decrypted = await decryptText(record.encryptedData);
          results.push({
            id: record.id,
            ...JSON.parse(decrypted),
            created: record.created
          });
        } catch (e) {
          console.error('Errore decifratura record:', e);
        }
      }
    }

    return results;
  }

  async function remove(storeName, id) {
    if (!currentUser) throw new Error('Utente non loggato');

    const database = await openDB();
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Verifica proprietà prima di eliminare
    const record = await storeRequest(store, 'get', id);
    if (record && record.userId === currentUser.id) {
      return await storeRequest(store, 'delete', id);
    }

    throw new Error('Accesso negato o record non trovato');
  }

  // ==================== ANONYMIZER ====================
  function anonymize(text) {
    const techWords = [
      'meccanismo', 'rotazione', 'impugnatura', 'utensile', 
      'dispositivo', 'configurazione', 'elemento', 'struttura', 
      'funzione', 'punte', 'cacciavite', 'ergonomia', 'manico', 
      'testa', 'corpo', 'base', 'motore', 'energia', 'elettrico',
      'idraulico', 'pneumatico', 'termico', 'ottico', 'acustico'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const concepts = techWords.filter(w => words.some(uw => uw.includes(w)));

    // Genera vector embedding semplificato
    const vector = concepts.map((c, i) => {
      let hash = 0;
      for (let j = 0; j < c.length; j++) {
        hash = ((hash << 5) - hash) + c.charCodeAt(j);
        hash = hash & hash;
      }
      return Math.sin(hash + i) * 0.5;
    });

    return {
      concepts: concepts,
      vector: vector,
      timestamp: Date.now(),
      originalLength: text.length
    };
  }

  // ==================== INTERCETTAZIONE FORM ====================
  function interceptForms() {
    // Trova tutti i form nella pagina
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        // Se E2E attivo, cifra i dati prima dell'invio
        if (isInitialized && encryptionKey) {
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });

          // Cifra e salva in IndexedDB
          const storeName = form.dataset.e2eStore || 'form_data';
          await save(storeName, data);

          console.log('[BrevettIAmoE2E] Dati form cifrati e salvati:', storeName);
        }
      });
    });
  }

  // ==================== EXPORT DATI ====================
  async function exportData() {
    if (!currentUser) throw new Error('Utente non loggato');
    if (!encryptionKey) throw new Error('Chiave non disponibile');

    const stores = [
      'privacy', 'nda', 'acquisti', 'chat_messages', 'chat_files',
      'disegni', 'occhio_searches', 'occhio_alerts', 'occhio_reports',
      'pratiche', 'documenti', 'preferenze'
    ];

    const exportData = {
      userId: currentUser.id,
      exportDate: Date.now(),
      version: '1.0',
      stores: {}
    };

    for (const storeName of stores) {
      try {
        const records = await loadAll(storeName);
        exportData.stores[storeName] = records;
      } catch (e) {
        console.warn(`Store ${storeName} vuoto o errore:`, e);
        exportData.stores[storeName] = [];
      }
    }

    // Crea file JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `brevettiamo-backup-${currentUser.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    return exportData;
  }

  // ==================== STATISTICHE ====================
  async function getStats() {
    if (!currentUser) return null;

    const stores = [
      'chat_messages', 'chat_files', 'disegni',
      'occhio_searches', 'occhio_alerts', 'occhio_reports',
      'pratiche', 'documenti'
    ];

    const stats = {
      userId: currentUser.id,
      totalRecords: 0,
      stores: {}
    };

    for (const storeName of stores) {
      try {
        const records = await loadAll(storeName);
        stats.stores[storeName] = records.length;
        stats.totalRecords += records.length;
      } catch (e) {
        stats.stores[storeName] = 0;
      }
    }

    // Calcola spazio approssimativo
    const spaceKB = Math.round(stats.totalRecords * 2);
    stats.spaceUsed = spaceKB + ' KB';

    return stats;
  }

  // ==================== LOGOUT ====================
  function logout() {
    encryptionKey = null;
    currentUser = null;
    isInitialized = false;
    localStorage.removeItem('brevettiamo_user');
    console.log('[BrevettIAmoE2E] Logout completato. E2E disattivato.');
  }

  // ==================== UTILITY ====================
  function isLoggedIn() {
    return currentUser !== null && encryptionKey !== null;
  }

  function getCurrentUser() {
    return currentUser;
  }

  function isReady() {
    return isInitialized;
  }

  // ==================== API PUBBLICA ====================
  return {
    // Inizializzazione
    init: init,
    isReady: isReady,

    // Login/Logout
    handleGoogleLogin: handleGoogleLogin,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,

    // CRUD cifrato
    save: save,
    update: update,
    load: load,
    loadAll: loadAll,
    remove: remove,

    // Crittografia diretta
    encrypt: encryptText,
    decrypt: decryptText,
    encryptFile: encryptFile,
    decryptFile: decryptFile,

    // Anonymizer
    anonymize: anonymize,

    // Form
    interceptForms: interceptForms,

    // Export/Stats
    exportData: exportData,
    getStats: getStats
  };
})();

// Esponi globalmente
window.BrevettIAmoE2E = BrevettIAmoE2E;

console.log('[BrevettIAmoE2E] Modulo caricato. Pronto per l\'uso.');
console.log('[BrevettIAmoE2E] Chiama BrevettIAmoE2E.init() per inizializzare.');
