# Sentinella Camino

Sistema di monitoraggio intelligente del camino con rilevamento automatico dello stato (acceso/spento) tramite intelligenza artificiale.

## 📋 Descrizione

Sentinella Camino è un'applicazione desktop Electron che monitora in tempo reale lo stato del tuo camino. Il sistema utilizza un dispositivo mobile Android per scattare foto periodiche del camino, che vengono analizzate da un agente AI per determinare se il camino è acceso o spento. L'applicazione fornisce notifiche immediate quando il camino si spegne e monitora anche lo stato del dispositivo mobile (batteria, connessione WiFi).

## 🏗️ Architettura del Sistema

Il sistema è composto da diversi componenti che comunicano tra loro:

```
┌─────────────────┐
│  Dispositivo    │
│  Mobile Android  │
│  (Script Python) │
└────────┬─────────┘
         │
         │ Webhook HTTP
         ▼
┌─────────────────┐
│      N8N        │
│  (Automazione)   │
│                 │
│  ┌───────────┐  │
│  │ AI Agent  │  │ ← Analizza immagine
│  │  (Nodo)   │  │   per determinare
│  └─────┬─────┘  │   stato camino
│        │        │
│  ┌─────▼─────┐  │
│  │ Broadcast │  │
│  │  (Nodo)   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ Canali Broadcast
         ▼
┌─────────────────┐
│    Supabase     │
│  (Real-time DB) │
└────────┬────────┘
         │
         │ Subscription Real-time
         ▼
┌─────────────────┐
│  Electron App   │
│  (Desktop)      │
└─────────────────┘
```

### Componenti Principali

1. **Script Python Mobile** (`documentation/mobile_script.py`)
   - Esegue sul dispositivo Android tramite Termux
   - Scatta foto del camino ogni 30 minuti
   - Invia informazioni del dispositivo (batteria, WiFi) ogni minuto
   - Comunica con N8N tramite webhook HTTP

2. **N8N (Automazione Workflow)**
   - **Webhook Receiver**: Riceve foto e dati dal dispositivo mobile
   - **AI Agent Node**: Analizza le immagini per determinare se il camino è acceso o spento
   - **Broadcast Node**: Invia i risultati ai canali Supabase per la comunicazione real-time

3. **Supabase**
   - Database per lo storage delle rilevazioni
   - Canali broadcast per comunicazione real-time tra N8N e l'app Electron
   - I canali utilizzati sono:
     - `rilevazione`: Nuove rilevazioni dello stato del camino
     - `rilevazione_loading`: Stato di caricamento durante l'analisi
     - `monitoraggio_telefono`: Informazioni del dispositivo mobile
     - `test_foto`: Foto di test scattate manualmente

4. **Applicazione Electron**
   - Interfaccia desktop per visualizzare le rilevazioni
   - Riceve eventi real-time da Supabase
   - Controlla il dispositivo mobile via SSH
   - Mostra notifiche quando il camino si spegne o la batteria è bassa

### Funzionamento SSH

L'applicazione Electron utilizza connessioni SSH per controllare il dispositivo mobile:

- **Collegamento Dispositivo**: Avvia lo script Python principale sul dispositivo mobile
- **Scatto Foto Manuale**: Esegue uno script di test per scattare una foto immediata
- **Scollegamento Dispositivo**: Termina lo script Python e sblocca il dispositivo
- **Verifica Stato**: Controlla se lo script Python è in esecuzione

Le credenziali SSH sono configurate nel file `.env` (non incluso nel repository per motivi di sicurezza).

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Desktop**: Electron 39
- **Real-time Communication**: Supabase (canali broadcast)
- **Automazione**: N8N (workflow automation)
- **AI/ML**: Nodo AI Agent in N8N per analisi immagini
- **Remote Control**: SSH2 (Node.js) per controllo dispositivo mobile
- **Mobile Script**: Python 3 con Termux API
- **Build Tool**: Electron Builder, Electron Vite

## 📁 Struttura del Progetto

```
sentinella_camino/
├── src/
│   ├── main/           # Processo principale Electron
│   ├── preload/         # Script preload per IPC
│   └── renderer/        # Interfaccia React
├── documentation/       # Script Python per dispositivo mobile
├── build/              # Risorse build (icone, ecc.)
└── dist/               # Build output
```

Per maggiori dettagli sulla struttura del codice, consulta [src/README.md](src/README.md).

## ⚙️ Configurazione

### File .env

L'applicazione richiede un file `.env` nella root del progetto per funzionare correttamente. Questo file **non è incluso nel repository** per motivi di sicurezza.

Il file `.env` deve contenere:

```env
# Credenziali SSH per dispositivo mobile
HOST_SSH=indirizzo_ip_dispositivo
PORT_SSH=22
USERNAME_SSH=username_ssh
PASSWORD_SSH=password_ssh

# Variabili Supabase (per il renderer)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
```



### Script Python Mobile

Gli script Python nella cartella `documentation/` sono inclusi nel repository solo per completezza. Le URL dei webhook presenti negli script sono esempi/placeholder. Nella versione reale, le URL vengono configurate localmente sul dispositivo mobile.

Per maggiori dettagli sugli script Python, consulta [documentation/README.md](documentation/README.md).

## 🚀 Setup e Installazione

### Prerequisiti

- Node.js 18+ e npm
- Git

### Installazione Dipendenze

```bash
npm install
```

### Sviluppo

```bash
npm run dev
```

Avvia l'applicazione in modalità sviluppo con hot-reload.

### Build per Produzione

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

I file compilati saranno disponibili nella cartella `dist/`.

### Build senza Installer (per test)

```bash
npm run build:unpack
```

Crea una build non installata nella cartella `dist/win-unpacked/` (o equivalente per altre piattaforme).

## 📝 Script Disponibili

- `npm run dev` - Avvia in modalità sviluppo
- `npm run build` - Compila TypeScript e prepara i file
- `npm run build:win` - Build completo per Windows
- `npm run build:mac` - Build completo per macOS
- `npm run build:linux` - Build completo per Linux
- `npm run build:unpack` - Build senza installer
- `npm run typecheck` - Verifica tipi TypeScript
- `npm run lint` - Esegue ESLint
- `npm run format` - Formatta codice con Prettier

## 🔒 Sicurezza

- Il file `.env` con credenziali SSH **non è incluso** nel repository
- Le variabili d'ambiente Supabase sono pubbliche (publishable key) e possono essere incluse nel codice
- Per distribuzione pubblica, considera alternative più sicure per la gestione delle credenziali SSH

## 📚 Documentazione Aggiuntiva

- [Struttura del codice sorgente](src/README.md)
- [Script Python mobile](documentation/README.md)

## 🤝 Contribuire

Questo è un progetto personale per uso locale. Se vuoi contribuire o hai domande, apri una issue.

## 📄 Licenza

Questo progetto è per uso personale.
