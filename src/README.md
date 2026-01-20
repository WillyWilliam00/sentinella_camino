# Struttura del Codice Sorgente

Questa cartella contiene tutto il codice sorgente dell'applicazione Electron.

## 📁 Struttura delle Cartelle

```
src/
├── main/           # Processo principale Electron (Node.js)
├── preload/        # Script preload per bridge sicuro tra main e renderer
└── renderer/       # Interfaccia utente React
```

### `main/` - Processo Principale Electron

Il processo principale (`main/index.ts`) gestisce:
- Creazione e gestione delle finestre
- Comunicazione IPC (Inter-Process Communication) con il renderer
- Connessioni SSH per controllo del dispositivo mobile
- Notifiche desktop
- Caricamento delle variabili d'ambiente

**File principali:**
- `index.ts`: Entry point del processo principale con tutte le funzionalità SSH e IPC

### `preload/` - Script Preload

Gli script preload (`preload/index.ts`) creano un bridge sicuro tra il processo principale e il renderer, esponendo solo le API necessarie.

**Funzionalità:**
- Espone API Electron tramite `contextBridge` per sicurezza
- Definisce l'interfaccia `electronAPI` per la comunicazione IPC
- Gestisce eventi bidirezionali tra main e renderer

**API esposte:**
- `mandaOrdineScatto()`: Richiede uno scatto foto manuale
- `mandaCollegaDispositivo()`: Avvia il monitoraggio del dispositivo
- `mandaScollegaDispositivo()`: Termina il monitoraggio
- `mostraNotificaTelefonoScarico()`: Mostra notifica batteria bassa
- `mostraNotificaCaminoSpento()`: Mostra notifica camino spento
- `checkPythonRunning()`: Verifica stato script Python
- `onPythonStatus(callback)`: Ascolta cambiamenti dello stato Python

### `renderer/` - Interfaccia Utente React

L'interfaccia utente è costruita con React, TypeScript e TailwindCSS.

## 🧩 Componenti React

I componenti si trovano in `renderer/src/components/`:

### `Dashboard.tsx`
Componente principale che mostra le rilevazioni del camino e gestisce lo stato dell'applicazione.

**Funzionalità:**
- Sottoscrizione ai canali real-time Supabase per rilevazioni
- Gestione dello stato delle rilevazioni (loading, dati, errori)
- Calcolo del tempo rimanente alla prossima rilevazione
- Mostra notifiche quando il camino si spegne

**Props:** Nessuna (componente principale)

### `DispositivoInfo.tsx`
Mostra informazioni dettagliate del dispositivo mobile connesso.

**Funzionalità:**
- Visualizza stato connessione (connesso/disconnesso)
- Mostra informazioni dispositivo:
  - Modello e sistema operativo
  - Percentuale batteria con indicatore visivo
  - Stato carica (in carica/non in carica)
  - Temperatura batteria
  - Segnale WiFi (RSSI) con valutazione qualità
  - Velocità connessione WiFi (Mbps)
- Pulsanti per collegare/scollegare dispositivo
- Notifica quando batteria scende sotto 20%
- Gestione stati di loading durante connessione/disconnessione

**Props:**
- `setRilevazioni`: Funzione per resettare le rilevazioni quando si scollega

### `RilevazioneCard.tsx`
Card che visualizza la foto e lo stato del camino.

**Funzionalità:**
- Mostra l'immagine del camino
- Visualizza data e ora della rilevazione
- Indica lo stato del camino (ACCESO/SPENTO) con indicatori colorati
- Mostra stato di loading durante l'analisi AI
- Pulsante per chiudere la card

**Props:**
- `rilevazione`: Oggetto con dati della rilevazione (può essere null)
- `isLoading`: Boolean che indica se l'analisi è in corso
- `onClose`: Callback per chiudere la card

### `Layout.tsx`
Layout principale dell'applicazione con header e navigazione.

**Funzionalità:**
- Header fisso con logo e titolo
- Pulsante per scatto foto manuale (icona camera)
- Tooltip informativo sul pulsante foto
- Gestione routing con React Router
- Sottoscrizione al canale `test_foto` per foto manuali
- Modal per visualizzare foto di test

**Stato interno:**
- `fotoManuale`: URL della foto di test scattata
- `fotoManualeLoading`: Stato di loading durante lo scatto

### `FotoModal.tsx`
Modal per visualizzare foto di test scattate manualmente.

**Funzionalità:**
- Mostra foto in modal fullscreen
- Indicatore di loading durante lo scatto
- Pulsante per chiudere il modal
- Messaggio personalizzabile durante il loading

**Props:**
- `foto`: URL della foto da mostrare (può essere null)
- `isLoading`: Boolean che indica se la foto è in caricamento
- `onClose`: Callback per chiudere il modal
- `messaggioLoading`: Messaggio personalizzato durante loading (opzionale)
- `altText`: Testo alternativo per l'immagine (opzionale)

### `About.tsx`
Pagina About (placeholder attualmente).

## 🎣 Hook Personalizzati

Gli hook si trovano in `renderer/src/hooks/`:

### `useRilevazioniRealtime.tsx`
Hook generico per sottoscriversi a canali broadcast Supabase.

**Funzionalità:**
- Sottoscrizione a uno o più canali Supabase
- Gestione automatica della connessione/disconnessione
- Callback per gestire eventi ricevuti
- Cleanup automatico quando il componente si smonta

**Parametri:**
- `channels`: Array di configurazioni canali `{ channelName, eventName }`
- `onEvent`: Callback chiamato quando arriva un evento

**Canali utilizzati:**
- `rilevazione` / `nuova_rilevazione`: Nuove rilevazioni del camino
- `rilevazione_loading` / `nuova_rilevazione_loading`: Stato di loading
- `monitoraggio_telefono` / `info`: Informazioni del dispositivo mobile
- `test_foto` / `foto`: Foto di test scattate manualmente

**Esempio:**
```typescript
useRilevazioniRealtime(
  [{ channelName: 'rilevazione', eventName: 'nuova_rilevazione' }],
  (event) => {
    console.log('Nuova rilevazione:', event.payload)
  }
)
```

### `usePythonIsRunning.tsx`
Hook per monitorare lo stato dello script Python sul dispositivo mobile.

**Funzionalità:**
- Verifica se lo script Python è in esecuzione
- Aggiorna lo stato in tempo reale
- Fornisce funzione per retry con polling

**Valori restituiti:**
- `statoPython`: 'connesso' | 'disconnesso'
- `refreshEithRetry`: Funzione per aggiornare lo stato con retry automatico

**Parametri `refreshEithRetry`:**
- `setLoading`: Funzione per impostare lo stato di loading
- `string`: 'connessione' | 'disconnessione'
- `tentativi`: Numero di tentativi (default: 3)
- `intervallo`: Intervallo tra tentativi in ms (default: 1000)

### `useTempoNuovaRilevazione.tsx`
Hook per calcolare il tempo rimanente alla prossima rilevazione.

**Funzionalità:**
- Calcola minuti e secondi rimanenti fino alla prossima rilevazione
- Aggiorna ogni secondo
- Intervallo fisso di 30 minuti (1800 secondi) tra rilevazioni

**Parametri:**
- `timestampOriginale`: Timestamp ISO dell'ultima rilevazione

**Valori restituiti:**
- `minutiRimanenti`: Numero di minuti rimanenti
- `secondiRimanenti`: Numero di secondi rimanenti (0-59)

## 📚 Librerie

### `lib/supabase.ts`
Client Supabase configurato per la comunicazione real-time.

**Funzionalità:**
- Inizializzazione client Supabase
- Configurazione URL e chiave pubblica
- Utilizzato dagli hook per sottoscrizioni real-time

**Variabili d'ambiente richieste:**
- `VITE_SUPABASE_URL`: URL del progetto Supabase
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Chiave pubblica Supabase

## 🔄 Comunicazione IPC

La comunicazione tra il processo principale (main) e il renderer avviene tramite IPC (Inter-Process Communication) gestito da Electron.

### Flusso di Comunicazione

```
Renderer (React) 
    ↓
Preload (contextBridge)
    ↓
IPC (ipcRenderer/ipcMain)
    ↓
Main Process (Node.js)
```

### Eventi IPC Utilizzati

**Da Renderer a Main:**
- `avvia-scatto`: Richiede scatto foto manuale
- `collega-dispositivo`: Avvia monitoraggio dispositivo
- `scollega-dispositivo`: Termina monitoraggio
- `mostra-notifica-telefono-scarico`: Richiede notifica batteria bassa
- `mostra-notifica-camino-spento`: Richiede notifica camino spento
- `check-python-running`: Verifica stato script Python

**Da Main a Renderer:**
- `python-running`: Invia stato dello script Python (true/false)

### Esempio di Utilizzo

Nel renderer:
```typescript
// Invia comando
window.electronAPI.mandaOrdineScatto()

// Ascolta eventi
window.electronAPI.onPythonStatus((isRunning) => {
  console.log('Python running:', isRunning)
})
```

Nel main:
```typescript
// Ascolta comandi
ipcMain.on('avvia-scatto', () => {
  scattaFotoSSH()
})

// Invia eventi
mainWindow.webContents.send('python-running', true)
```

## 🎨 Styling

L'applicazione utilizza **TailwindCSS** per lo styling con un tema personalizzato basato su colori arancioni/ambra per richiamare il tema del camino.

**Colori principali:**
- Arancione/Ambra per elementi principali
- Verde per stati positivi (camino acceso, dispositivo connesso)
- Rosso/Arancione per stati di attenzione (camino spento, batteria bassa)

## 🗂️ Altri File

### `renderer/src/App.tsx`
Componente root dell'applicazione con configurazione React Router.

**Routing:**
- `/`: Dashboard (route principale)
- `/about`: Pagina About

### `renderer/src/main.tsx`
Entry point del renderer che monta l'app React nel DOM.

### `renderer/index.html`
Template HTML base dell'applicazione.

## 📝 Note Sviluppo

- Il codice utilizza TypeScript per type safety
- Gli hook personalizzati gestiscono automaticamente cleanup e sottoscrizioni
- La comunicazione real-time è gestita completamente da Supabase broadcast channels
- Le connessioni SSH sono gestite nel main process per sicurezza

